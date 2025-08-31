const path = require('path');
const rollup = require('rollup');
const uglify = require('uglify-es');
const typescript = require('typescript');
const assert = require('assert');
const stableSort = require('stable');
const rollupPluginHypothetical = require('rollup-plugin-hypothetical');

const markup = require('./markup.js');
const util = require('./util.js');
const fileUtils = require('./file_utils.js');
const options = require('./options.js');

// Represents a <script> element
class ScriptElement extends markup.HtmlElement {
    constructor(data, markupProcessData) {
        super(data, markupProcessData);

        this.isInline = !this.attributes.has('src'); // It's an inline script when it has no src
        this.isModule = this.attributes.get('type') === 'module';

        this.isAsync = this.attributes.has('async');
        if (this.isInline) this.isAsync = false; // async is ignored for inline scripts

        this.isDefered = this.attributes.has('defer') || this.isModule;
        if (this.isInline && !this.isModule) this.isDefered = false; // defer is ignored for inline scripts, but not for inline modules

        this.isAbsolute = util.urlIsAbsolute(this.attributes.get('src') || '');
        this.file = null;

        if (!this.isInline && !this.isAbsolute) {
            this.file = fileUtils.navigateFromDirectoryWithRelativePath(this.markupProcessData.file.parent, this.attributes.get('src'));
        }
    }
}

const SCRIPT_ELEMENT_DESCRIPTION = {
    name: 'script',
    hasClosingTag: true,
    constructor: ScriptElement
};
const POLYFILL_IO_SRC = `https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js`;

// Get all <script> elements from the markup
function getScriptElements(markupProcessData) {
    let scriptElements = markup.getAllElementsByTag(markupProcessData, SCRIPT_ELEMENT_DESCRIPTION);

    return scriptElements;
}

async function processScriptElements(markupProcessData) {
    markupProcessData.bundler.log("Processing script elements...");

    let allScriptElements;
    if (markupProcessData.options.bundleScript)
        allScriptElements = await bundleScripts(markupProcessData);
    else
        allScriptElements = await labelNecessaryScriptFiles(markupProcessData);

    // Regardless of the bundling option, insert the polyfill if specified
    if (allScriptElements.length > 0 && markupProcessData.options.insertPolyfill) insertPolyfill(markupProcessData);
}

async function bundleScripts(markupProcessData) {
    let stringSplicer = new util.StringSplicer(markupProcessData.contents);
    let { bundlers: scriptBundlers, allScriptElements } = await getScriptBundlers(markupProcessData, stringSplicer);

    for (let bundler of scriptBundlers) {
        let isLocalBundler = bundler.insertPosition === options.OptionConstants.LOCAL;

        // This is important for getting the first element, index-wise
        bundler.sortElementsByIndex();

        for (let element of bundler.allElements) {
            let { start, end } = element.getCutBounds();

            // Don't cut the whitespace infront of the first element
            if (isLocalBundler) start = Math.max(start, bundler.allElements[0].index);
            
            stringSplicer.addCut(start, end - start);
        }

        if (isLocalBundler) {
            let insertIndex = bundler.allElements[0].index; // Beginning of first element
            stringSplicer.addInsert(insertIndex, bundler.finalElements.join(''));
        } else {
            let insertIndex = markupProcessData.getIndexByInsertTargetData(options.getTargetDataFromInsertPosition(bundler.insertPosition));
            stringSplicer.addInsert(insertIndex, bundler.finalElements.join(''));
        }
    }

    let result = stringSplicer.execute();
    markupProcessData.contents = result;

    markupProcessData.updateExclusionRanges();

    return allScriptElements;
}

// Labels all the scripts the markup includes as 'necessary'. This step requires extra computing for modules scripts, as their dependencies need to be resolved first.
async function labelNecessaryScriptFiles(markupProcessData) {
    let scriptElements = getScriptElements(markupProcessData);

    for (let element of scriptElements) {
        let { file, isModule } = element;
        if (!file || file.isNecessary) continue;

        // If module script and that module script has not yet been processed. We want to avoid resolving module scripts twice, because it's an expensive operation to do
        if (isModule && !markupProcessData.bundler.necessaryModuleFiles.has(file)) {
            markupProcessData.bundler.log("Resolving ES6 module dependencies...")

            let rolledUp = await rollup.rollup({
                input: file.getAbsolutePath(),
                onwarn: () => {} // Silence the warnings
            });
            let files = getFilesFromRollupModuleData(rolledUp.modules, markupProcessData.bundler);

            for (let moduleFile of files) {
                if (moduleFile) moduleFile.isNecessary = true;
            }

            // Remember that this module file has been resolved
            markupProcessData.bundler.necessaryModuleFiles.add(file);
        }

        file.isNecessary = true;
    }

    return scriptElements;
}

// Gets all the script bundlers. The reason there are multiple bundlers is because for a setting like InsertPosition.LOCAL, each bundler refers to a specific place in the markup.
async function getScriptBundlers(markupProcessData, stringSplicer) {
    let allScriptElements = getScriptElements(markupProcessData);

    let bundlers = [];
    let currentBundler;
    let currentScriptElements = [];
    let lastElement = null;
    let additionalExclusionRanges = [];
    let includedModuleScriptSources = new Set();

    await addBundler();

    for (let element of allScriptElements) {
        // Take care of script elements with a local src attribute that point to a non-existing file
        if (element.attributes.has('src') && !element.isAbsolute && !element.file) {
            // Missing local file!

            let action = markupProcessData.options.missingScriptFileTagAction;
            let { start, end } = element.getCutBounds();

            // This exclusion range is added so that this script element doesn't cause a break in the bundling.
            let exclusionRange = new markup.ExclusionRange(start, end);
            additionalExclusionRanges.push(exclusionRange);

            if (action === options.OptionConstants.KEEP) continue; // Skip over it, without adding it to a bundler
            else if (action === options.OptionConstants.REMOVE) stringSplicer.addCut(start, end - start);

            lastElement = element;
            continue;
        }

        // Handle inline scripts
        if (element.isInline) {
            if (!markupProcessData.options.handleInlineScript) {
                await addBundler();

                lastElement = element;
                continue;
            }
        }

        // Allow each module src to be imported only once. Browsers ignore the same module being imported more than twice.
        if (element.isModule) {
            let src = element.attributes.get("src");

            if (src) {
                if (includedModuleScriptSources.has(src)) {
                    // It's already in here, we can skip this element.
                    continue;
                } else {
                    // Otherwise, remember it's in here.
                    includedModuleScriptSources.add(src);
                }
            }
        }

        // Handle scripts with the 'async' attribute
        if (element.isAsync) {
            await addBundler();

            currentScriptElements.push(element);
            await addBundler();
            
            lastElement = element;
            continue;
        }

        // If insert position is set to LOCAL, see if there is non-empty text inbetween the two elements. If so, add a new bundler, 'cause we need to break here.
        if (markupProcessData.options.scriptInsertPosition === options.OptionConstants.LOCAL) {
            if (lastElement) {
                if (!markupProcessData.isEmptyInRange(lastElement.index + lastElement.string.length, element.index, additionalExclusionRanges)) {
                    await addBundler();
                }
            }
        }

        // For all other scripts
        currentScriptElements.push(element);
        lastElement = element;
    }
    await addBundler();

    async function addBundler() {
        if (currentBundler && currentScriptElements.length) {
            sortScriptElementsByDefer(currentScriptElements);

            await addScriptElementsToScriptBundler(currentScriptElements, currentBundler);
            bundlers.push(currentBundler);
        }

        currentBundler = new ScriptFileBundler(markupProcessData);
        currentScriptElements = [];
    }

    return { bundlers, allScriptElements };
}

// Some script elements cannot be bundled together, like non-defered and defered, or non-module and module scripts. This function takes care of that.
async function addScriptElementsToScriptBundler(scriptElements, scriptBundler) {
    for (let element of scriptElements) {
        let file = element.file;
        let body = element.body;
        let src = element.attributes.get('src');
        let isAbsolute = element.isAbsolute;
        let isDefered = element.isDefered;
        let isModule = element.isModule;

        if (src) { // If the script contains a 'src' attribute
            if (isAbsolute) { // If non-local script
                await scriptBundler.addCurrentBundle();

                scriptBundler.add(null, null, element);
                await scriptBundler.addCurrentBundle();
            } else if (isModule) { // If module
                await scriptBundler.addCurrentBundle();

                assert(file);
    
                scriptBundler.add(null, file, element);
                await scriptBundler.addCurrentBundle();
            } else { // In all other cases
                let reference = scriptBundler.getCurrentBundleReferenceElement();
                if (reference) {
                    // If the current bundle's defered state doesn't equal this script's defered state, create a new bundle, because elements need to have the same defered state in order to be bundled together
                    if (reference.isDefered !== isDefered) await scriptBundler.addCurrentBundle();
                }

                assert(file);
    
                let contents = file.getRawContents();
                scriptBundler.add(contents, file, element);
            }
        } else if (body) {
            if (isModule) { // If inline module
                await scriptBundler.addCurrentBundle();

                scriptBundler.add(body, null, element);
                await scriptBundler.addCurrentBundle();
            } else { // If regular inline script
                let reference = scriptBundler.getCurrentBundleReferenceElement();
                if (reference) {
                    // If the current bundle's defered state doesn't equal this script's defered state, create a new bundle, because elements need to have the same defered state in order to be bundled together
                    if (reference.isDefered !== isDefered) await scriptBundler.addCurrentBundle();
                }

                scriptBundler.add(body, null, element);
            }
        }
    }
    await scriptBundler.addCurrentBundle();
}

class ScriptFileBundler {
    constructor(markupProcessData) {
        this.markupProcessData = markupProcessData;
        this.insertPosition = this.markupProcessData.options.scriptInsertPosition;
        this.allElements = [];
        this.currentBundleCode = '';
        this.currentBundleFiles = [];
        this.currentBundleElements = [];
        this.finalElements = [];
    }

    add(code = null, file = null, element) {
        assert(element);

        if (code !== null) {
            if (this.currentBundleCode.length > 0) {
                if (this.currentBundleCode.charAt(this.currentBundleCode.length - 1) !== ';') this.currentBundleCode += ';'; // Append a semicolon to avoid accidental breaking of appending multiple scripts that don't have a terminating semicolon
                this.currentBundleCode += '\n\n';
            }
            this.currentBundleCode += code;
        }
        if (file !== null) this.currentBundleFiles.push(file);
        if (element !== null) {
            this.allElements.push(element);
            this.currentBundleElements.push(element);
        }
    }

    // The first element in the bundle is assumed to contain information applicapable to all elements in the bundle
    getCurrentBundleReferenceElement() {
        return this.currentBundleElements[0];
    }

    // Create a bundle file from the current elements
    async addCurrentBundle() {
        if (this.currentBundleElements.length === 0) return;

        // The entire bundle is assumed to have the same properties as its first element
        let reference = this.getCurrentBundleReferenceElement();
        let attributeList = reference.attributes.clone();

        // Due to their nature, async scripts should always be inserted were they were found
        if (reference.isAsync) {
            assert(this.currentBundleElements.length === 1);
            this.insertPosition = options.OptionConstants.LOCAL;
        }

        if (reference.isAbsolute) {
            let elementStr = markup.createHtmlElementString('script', true, attributeList);
            this.finalElements.push(elementStr);
        } else {
            // Called later on.
            function modifyAttributes() {
                // Module scripts, when rolled up, lose their type="module". Since type="module" scripts are defered however, we need to add the defer attribute.
                if (reference.isModule) {
                    attributeList.remove('type');
                    attributeList.set('defer');
                }
                if (reference.body) {
                    attributeList.remove('async');
                    if (!reference.isModule) attributeList.remove('defer');
                }
            }
            
            // Get existing bundle if possible
            let bundle = findMatchingScriptBundle(this.currentBundleElements, this.markupProcessData);
            let code;
    
            if (bundle) {
                code = bundle.getCode();
            } else { // Create new bundle
                let processedFiles = [];
    
                if (reference.isModule) {
                    let result;
                    let isInlineModule = !reference.attributes.get('src');
    
                    if (isInlineModule) {
                        result = await rollupCode(this.currentBundleCode, this.markupProcessData);
                    } else {
                        assert(this.currentBundleFiles.length === 1);
    
                        let file = this.currentBundleFiles[0];
                        result = await rollupFile(file, this.markupProcessData.bundler);
                    }
    
                    code = result.code;
                    processedFiles.push(...result.processedFiles);
                } else {
                    code = this.currentBundleCode;
                }
                code = processCode(code, this.markupProcessData.bundler, this.markupProcessData.options);
                
                if (this.markupProcessData.options.injectScript) {
                    // Create a virtual bundle
                    bundle = this.markupProcessData.bundler.createBundle('.js', this.currentBundleElements, code, true, this.markupProcessData.options);
                } else {
                    // Create a non-virtual bundle
                    bundle = this.markupProcessData.bundler.createBundle('.js', this.currentBundleElements, code, false, this.markupProcessData.options);
                }
    
                for (let file of this.currentBundleFiles) {
                    file.bundles.add(bundle);
                }
                for (let file of processedFiles) {
                    if (file) file.bundles.add(bundle);
                }
            }
    
            if (this.markupProcessData.options.injectScript) {
                // Sanitize script for injection
                if (this.markupProcessData.options.sanitizeInjectedScript) code = sanitizeCode(code, this.markupProcessData.bundler);

                modifyAttributes();

                // We can ignore defer and async for inline scripts, as those are ignored by the browser for inline scripts
                attributeList.remove('async');
                attributeList.remove('defer');
                if (reference.isModule) attributeList.set('type', 'module'); // Force the inline module script to be derfered. (regular defer is ignored for inline scripts, however type="module" is not. Is this a hack? Dunno.)
    
                let elementStr = markup.createHtmlElementString('script', true, attributeList, code);
                this.finalElements.push(elementStr);
            } else {
                // Incase it was virtual before, set it to be non-virtual, because the file actually needs to be written to disk
                bundle.setVirtualState(false);

                let pathString = fileUtils.getPathFromFileAToFileB(this.markupProcessData.file, bundle.file);    
                attributeList.set('src', pathString);

                modifyAttributes();
    
                let elementStr = markup.createHtmlElementString('script', true, attributeList);
                this.finalElements.push(elementStr);
            }
        }

        this.currentBundleCode = '';
        this.currentBundleFiles = [];
        this.currentBundleElements = [];
    }

    sortElementsByIndex() {
        stableSort.inplace(this.allElements, (a, b) => a.index - b.index); // Sort by index
    }
}

function processCode(code, bundler, bundlerOptions) {
    bundler.log("Processing script...");

    // Transpile
    if (bundlerOptions.transpileScript !== false) {
        let targetString = null;

        switch (bundlerOptions.transpileScript) {
            case options.OptionConstants.ES3: targetString = 'ES3'; break;
            case options.OptionConstants.ES5: case true: targetString = 'ES5'; break;
            case options.OptionConstants.ES6: targetString = 'ES6'; break;
            case options.OptionConstants.ES2016: targetString = 'ES2016'; break;
            case options.OptionConstants.ES2017: targetString = 'ES2017'; break;
            case options.OptionConstants.ESNEXT: targetString = 'ESNext'; break;
        }

        if (targetString) {
            // Transpile using TSC. Works surprisingly well!
            let transpilation = typescript.transpileModule(code, {
                compilerOptions: {
                    target: targetString
                }
            });

            let output = transpilation.outputText;
            if (output !== undefined && output !== null) code = output;
        }
    }

    // Wrap code in IIFE
    if (bundlerOptions.iifeScript) code = `(function(){\n${code}\n})();`;

    // Minify
    if (bundlerOptions.minifyScript) {
        let uglifyOptions = {};
        // Override the options with user-specified ones, if specified
        if (bundlerOptions.uglifyOptionsOverride) {
            Object.assign(uglifyOptions, bundlerOptions.uglifyOptionsOverride);
        }

        let minification = uglify.minify(code, uglifyOptions);
        
        if (minification.error) throw new Error(minification.error);
        else code = minification.code;
    }

    return code;
}

// Rollup an ES6 module script file
async function rollupFile(file, bundler) {
    bundler.log("Resolving ES6 module...");

    let absolutePath = file.getAbsolutePath();
    let rollupBundle = await rollup.rollup({
        input: absolutePath,
        onwarn: () => {} // Silence the warnings
    });
    let output = await rollupBundle.generate({format: 'es'});
    let code = output.code;

    // Get all processed files (files the module imports)
    let processedFiles = getFilesFromRollupModuleData(rollupBundle.modules, bundler);

    return { code, processedFiles };
}

// Rollup an ES6 module, but taking direct code as an entry point
async function rollupCode(code, markupProcessData) {
    markupProcessData.bundler.log("Resolving ES6 module...");

    // Generate a random virtual filename for this operation
    let randomFileName = util.generateRandomHexString() + '.js';
    let randomFilePath = path.join(markupProcessData.file.parent.getAbsolutePath(), randomFileName);

    let rollupBundle = await rollup.rollup({
        input: randomFilePath,
        plugins: [
            rollupPluginHypothetical({
                files: {
                    [randomFilePath]: code
                },
                allowFallthrough: true
            })
        ],
        onwarn: () => {} // Silence the warnings
    });
    let output = await rollupBundle.generate({format: 'es'});

    // Get all processed files (files the module imports)
    let processedFiles = getFilesFromRollupModuleData(rollupBundle.modules, markupProcessData.bundler);

    return { code: output.code, processedFiles };
}

// Replace '</script' with '\u003c/script' (so that it doesn't exit the <script> element)
function sanitizeCode(code, bundler) {
    bundler.log("Sanitizing script for injection...");

    let scriptEndTagRegEx = /<\/script/gi; // Just </script is enough for the browser to close the tag, the ending > is not needed.
    let match;

    while ((match = scriptEndTagRegEx.exec(code)) !== null) {
        let index = match.index;

        code = code.slice(0, index) + util.LESS_THAN_SIGN_UNICODE + code.slice(index + 1);
    }

    return code;
}

// Get references to all the files bundled up in an ES6 module
function getFilesFromRollupModuleData(data, bundler) {
    let files = data.map((a) => {
        let filePath = a.id;
        let filePathArray = filePath.split(path.sep);
        let relativePath = filePathArray.slice(bundler.srcPathArray.length).join(path.posix.sep);

        return fileUtils.navigateFromDirectoryWithRelativePath(bundler.root, relativePath);
    });

    return files;
}

// Move all defered elements to the end of the list, as those get executed last by the browser. Allows for better bundling.
function sortScriptElementsByDefer(arr) {
    stableSort.inplace(arr, (a, b) => {
        return (a.isDefered && !b.isDefered);
    });
}

// Handle an individual script file
async function handleScriptFile(file, bundler) {
    bundler.log(`Handling script file "${file.getRelativePath()}"...`);

    let bundlerOptions = bundler.options;
    bundlerOptions = options.getOverriddenOptionsIfPossible(bundlerOptions, file, bundlerOptions.individuallyHandledFilesOptionOverride);

    let code = file.getRawContents();
    code = processCode(code, bundler, bundlerOptions);

    file.contentOverride = code;
    file.isNecessary = true;
}

// Handle an individual script file as an ES6 module
async function handleModuleFile(file, bundler) {
    bundler.log(`Handling module file "${file.getRelativePath()}"...`);

    let bundlerOptions = bundler.options;
    bundlerOptions = options.getOverriddenOptionsIfPossible(bundlerOptions, file, bundlerOptions.individuallyHandledFilesOptionOverride);

    let { code } = await rollupFile(file, bundler);
    code = processCode(code, bundler, bundlerOptions);

    file.contentOverride = code;
    file.isNecessary = true;
}

// Find an already existing bundle based on comparison of elements.
function findMatchingScriptBundle(elements, markupProcessData) {
    let { bundler, options } = markupProcessData;

    for (let bundle of bundler.bundles) {
        if (bundle.file.extension !== '.js') continue;
        if (bundle.elements.length !== elements.length) continue;

        // Compare options
        if (options.minifyScript !== bundle.options.minifyScript) continue;
        if (options.transpileScript !== bundle.options.transpileScript) continue;
        if (options.iifeScript !== bundle.options.iifeScript) continue;
        if (options.sanitizeInjectedScript !== bundle.options.sanitizeInjectedScript) continue;
        if (!util.objectsAreEqual(options.uglifyOptionsOverride, bundle.options.uglifyOptionsOverride)) continue;

        // Compare elements
        let i;
        for (i = 0; i < elements.length; i++) {
            let e1 = elements[i];
            let e2 = bundle.elements[i];

            if (e1.isModule !== e2.isModule) break;
            if (!e1.file || !e2.file) break;
            if (e1.file !== e2.file) break;
        }

        // If all elements passed
        if (i === elements.length) return bundle;
    }
    
    return null;
}

// Inserts a Polyfill.io script to the top of the head
function insertPolyfill(markupProcessData) {
    // Create the element
    let attributes = new markup.HtmlElementAttributeList();
    attributes.set('src', POLYFILL_IO_SRC);
    attributes.set('crossorigin', 'anonymous');
    let scriptElementString = markup.createHtmlElementString('script', true, attributes);

    let stringSplicer = new util.StringSplicer(markupProcessData.contents);
    let insertPosition = options.OptionConstants.START_OF_HEAD; // START_OF_HEAD, because this is most likely before any other script being loaded
    let insertIndex = markupProcessData.getIndexByInsertTargetData(options.getTargetDataFromInsertPosition(insertPosition));
    stringSplicer.addInsert(insertIndex, scriptElementString);

    let result = stringSplicer.execute();
    markupProcessData.contents = result;

    markupProcessData.updateExclusionRanges();
}

exports.processScriptElements = processScriptElements;
exports.handleScriptFile = handleScriptFile;
exports.handleModuleFile = handleModuleFile;