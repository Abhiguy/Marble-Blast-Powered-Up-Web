const stableSort = require('stable');
const CleanCss = require('clean-css');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const assert = require('assert');

const markup = require('./markup.js');
const util = require('./util.js');
const fileUtils = require('./file_utils.js');
const options = require('./options.js');

// Represents a CSS-related element, which is either a <link> or a <style> element
class CssElement extends markup.HtmlElement {
    constructor(data, markupProcessData) {
        super(data, markupProcessData);

        this.isInline = this.tagName === 'style';
        this.isAbsolute = util.urlIsAbsolute(this.attributes.get('href') || '');
        this.file = null;

        if (!this.isInline && this.attributes.has('href') && !this.isAbsolute) {
            this.file = fileUtils.navigateFromDirectoryWithRelativePath(this.markupProcessData.file.parent, this.attributes.get('href'));
        }
    }
}

const LINK_ELEMENT_DESCRIPTION = {
    name: 'link',
    hasClosingTag: false,
    constructor: CssElement
};

const STYLE_ELEMENT_DESCRIPTION = {
    name: 'style',
    hasClosingTag: true,
    constructor: CssElement
};

// Get all <link> all <style> elements
function getCssElements(markupProcessData) {
    let cssElements = [];
    
    cssElements.push(...getCssLinkElements(markupProcessData));
    cssElements.push(...getStyleElements(markupProcessData));

    stableSort.inplace(cssElements, (a, b) => a.index - b.index); // Sort by index

    return cssElements;
}

// Get all stylesheet <link> elements from the markup
function getCssLinkElements(markupProcessData) {
    let allLinkElements = markup.getAllElementsByTag(markupProcessData, LINK_ELEMENT_DESCRIPTION);

    // Only return those with rel="stylesheet"
    return allLinkElements.filter((a) => a.attributes.has('rel', 'stylesheet') && a.attributes.has('href'));
}

// Get all <style> elements from the markup
function getStyleElements(markupProcessData) {
    return markup.getAllElementsByTag(markupProcessData, STYLE_ELEMENT_DESCRIPTION);
}

async function processCssElements(markupProcessData) {
    markupProcessData.bundler.log("Processing style elements...");

    if (markupProcessData.options.bundleCss) await bundleCss(markupProcessData);
    else await labelNecessaryCssFiles(markupProcessData);
}

async function bundleCss(markupProcessData) {
    let stringSplicer = new util.StringSplicer(markupProcessData.contents);
    let cssBundlers = await getCssBundlers(markupProcessData, stringSplicer);

    for (let bundler of cssBundlers) {
        let isLocalBundler = bundler.insertPosition === options.OptionConstants.LOCAL;

        // We don't have the following function call, because the elements should already be sorted by index:
        // bundler.sortElementsByIndex();
        // Heck, that's not even a method of CssFileBundler. So yeah, keep this commented out.

        for (let element of bundler.allElements) {
            let { start, end } = element.getCutBounds();

            // Aka don't cut the whitespace infront of the first element
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
}

// Labels all the CSS the markup includes as 'necessary'.
async function labelNecessaryCssFiles(markupProcessData) {
    let linkElements = getCssLinkElements(markupProcessData);

    for (let element of linkElements) {
        let { file } = element;
        if (!file) continue;

        file.isNecessary = true;
    }
}

// Gets all the CSS bundlers. The reason there are multiple bundlers is because for a setting like InsertPosition.LOCAL, each bundler refers to a specific place in the markup.
async function getCssBundlers(markupProcessData, stringSplicer) {
    let allCssElements = getCssElements(markupProcessData);

    let bundlers = [];
    let currentBundler;
    let currentCssElements = [];
    let lastElement = null;
    let additionalExclusionRanges = [];

    await addBundler();

    for (let element of allCssElements) {
        // Take care of CSS elements with a local href attribute that point to a non-existing file
        if (!element.isInline && !element.isAbsolute && !element.file) {
            // Missing local file!

            let action = markupProcessData.options.missingCssFileTagAction;
            let { start, end } = element.getCutBounds();

            // This exclusion range is added so that this CSS element doesn't cause a break in the bundling.
            let exclusionRange = new markup.ExclusionRange(start, end);
            additionalExclusionRanges.push(exclusionRange);

            if (action === options.OptionConstants.KEEP) continue; // Skip over it, without adding it to a bundler
            else if (action === options.OptionConstants.REMOVE) stringSplicer.addCut(start, end - start);

            lastElement = element;
            continue;
        }

        // Handle inline styles, aka <style> elements
        if (element.isInline) {
            if (!markupProcessData.options.handleInlineCss) {
                await addBundler();

                lastElement = element;
                continue;
            }
        }

        // If insert position is set to LOCAL, see if there is non-empty text inbetween the two elements. If so, add a new bundler, 'cause we need to break here.
        if (markupProcessData.options.cssInsertPosition === options.OptionConstants.LOCAL) {
            if (lastElement) {
                if (!markupProcessData.isEmptyInRange(lastElement.index + lastElement.string.length, element.index, additionalExclusionRanges)) {
                    await addBundler();
                }
            }
        }

        // For all other elements
        currentCssElements.push(element);
        lastElement = element;
    }
    await addBundler();

    async function addBundler() {
        if (currentBundler && currentCssElements.length) {
            await addCssElementsToCssBundler(currentCssElements, currentBundler);
            bundlers.push(currentBundler);
        }

        currentBundler = new CssFileBundler(markupProcessData);
        currentCssElements = [];
    }

    return bundlers;
}

// Some script elements cannot be bundled together, like local and non-local ones. This function takes care of that
async function addCssElementsToCssBundler(cssElements, cssBundler) {
    for (let element of cssElements) {
        let { isInline, isAbsolute, body, file } = element;

        if (!isInline) {
            if (isAbsolute) { // If non-local stylesheet
                await cssBundler.addCurrentBundle();

                cssBundler.add(null, null, element);
                await cssBundler.addCurrentBundle();
            } else { // If local
                assert(file);
        
                let contents = file.getRawContents();
                cssBundler.add(contents, file, element);
            }
        } else if (body) {
            cssBundler.add(body, null, element);
        }
        
    }
    await cssBundler.addCurrentBundle();
}

class CssFileBundler {
    constructor(markupProcessData) {
        this.markupProcessData = markupProcessData;
        this.insertPosition = markupProcessData.options.cssInsertPosition;
        this.allElements = [];
        this.currentBundleCode = '';
        this.currentBundleFiles = [];
        this.currentBundleElements = [];
        this.finalElements = [];
    }

    add(code = null, file = null, element) {
        assert(element);

        if (code !== null) {
            if (this.currentBundleCode.length > 0) this.currentBundleCode += '\n\n';
            this.currentBundleCode += code;
        }
        if (file !== null) {
            this.currentBundleFiles.push(file);
        }
        if (element !== null) {
            this.allElements.push(element);
            this.currentBundleElements.push(element);
        }
    }

    // The first element in the bundle is assumed to contain information applicapable to all elements in the bundle
    getCurrentBundleReferenceElement() {
        return this.currentBundleElements[0];
    }

    // Create a bundle from the current elements
    async addCurrentBundle() {
        if (this.currentBundleElements.length === 0) return;

        // The entire bundle is assumed to have the same properties as its first element
        let reference = this.getCurrentBundleReferenceElement();
        let attributeList = reference.attributes.clone();

        if (reference.isAbsolute) {
            let elementStr = markup.createHtmlElementString('link', false, attributeList);
            this.finalElements.push(elementStr);
        } else {
            // Get existing bundle if possible
            let bundle = findMatchingCssBundle(this.currentBundleElements, this.markupProcessData);
            let code;

            if (bundle) {
                code = bundle.getCode();
            } else { // Create new bundle
                code = await processCss(this.currentBundleCode, this.markupProcessData.bundler, this.markupProcessData.options);

                if (this.markupProcessData.options.injectCss) {
                    // Create a virtual bundle
                    bundle = this.markupProcessData.bundler.createBundle('.css', this.currentBundleElements, code, true, this.markupProcessData.options);
                } else {
                    // Create a non-virtual bundle
                    bundle = this.markupProcessData.bundler.createBundle('.css', this.currentBundleElements, code, false, this.markupProcessData.options);
                }

                for (let file of this.currentBundleFiles) {
                    file.bundles.add(bundle);
                }
            }

            if (this.markupProcessData.options.injectCss) {
                // Sanitize CSS for injection
                if (this.markupProcessData.options.sanitizeInjectedCss) code = sanitizeCss(code, this.markupProcessData.bundler);

                let elementStr = markup.createHtmlElementString('style', true, null, code);
                this.finalElements.push(elementStr);
            } else {
                // Incase it was virtual before, set it to be non-virtual, because the file actually needs to be written to disk
                bundle.setVirtualState(false);

                let pathString = fileUtils.getPathFromFileAToFileB(this.markupProcessData.file, bundle.file);
                attributeList.set('href', pathString);

                let elementStr = markup.createHtmlElementString('link', false, attributeList);
                this.finalElements.push(elementStr);
            }
        }

        this.currentBundleCode = '';
        this.currentBundleFiles = [];
        this.currentBundleElements = [];
    }
}

async function processCss(code, bundler, bundlerOptions) {
    bundler.log("Processing CSS...");

    // Add vendor prefixes
    if (bundlerOptions.autoprefixCss) code = await autoprefixCss(code);
    
    // Minify / optimize
    if (bundlerOptions.minifyCss || bundlerOptions.optimizeCss) {
        let cleanCssOptions = {};

        if (!bundlerOptions.minifyCss) cleanCssOptions.format = 'beautify'; // Meaning: "Don't minify"
        if (bundlerOptions.optimizeCss) cleanCssOptions.level = { // Meaning: All default optimization options
            2: {}
        };

        let result = new CleanCss(cleanCssOptions).minify(code);
        if (result.errors.length) {
            result.errors.forEach((a) => console.error(a));
            throw new Error("Error processing CSS");
        }

        code = result.styles;
    }

    return code;
}

// Automatically add vendor prefixes to the CSS
function autoprefixCss(code) {
    return new Promise((resolve, reject) => {
        postcss([autoprefixer()]).process(code, {from: undefined}).then((result) => { 
            result.warnings().forEach((warn) => {
                console.warn('CSS autoprefixer warning: ' + warn.toString());
            });

            resolve(result.css);
        }).catch((e) => reject(e));
    });
}

// Replace '</style' with '\u003c/style' (so that it doesn't exit the <style> element)
function sanitizeCss(code, bundler) {
    bundler.log("Sanitizing CSS for injection...");

    let styleEndTagRegEx = /<\/style/gi; // Just </style is enough for the browser to close the tag, the ending > is not needed.
    let match;

    while ((match = styleEndTagRegEx.exec(code)) !== null) {
        let index = match.index;

        code = code.slice(0, index) + util.LESS_THAN_SIGN_UNICODE + code.slice(index + 1);
    }

    return code;
}

// Handle an individual CSS file
async function handleCssFile(file, bundler) {
    bundler.log(`Handling CSS file "${file.getRelativePath()}"...`);

    let bundlerOptions = bundler.options;
    bundlerOptions = options.getOverriddenOptionsIfPossible(bundlerOptions, file, bundlerOptions.individuallyHandledFilesOptionOverride);

    let code = file.getRawContents();
    code = await processCss(code, bundler, bundlerOptions);

    file.contentOverride = code;
    file.isNecessary = true;
}

// Find an already existing bundle based on comparison of elements.
function findMatchingCssBundle(elements, markupProcessData) {
    let { bundler, options } = markupProcessData;

    for (let bundle of bundler.bundles) {
        if (bundle.file.extension !== '.css') continue;
        if (bundle.elements.length !== elements.length) continue;

        // Compare options
        if (options.minifyCss !== bundle.options.minifyCss) continue;
        if (options.optimizeCss !== bundle.options.optimizeCss) continue;
        if (options.autoprefixCss !== bundle.options.autoprefixCss) continue;
        if (options.sanitizeCss !== bundle.options.sanitizeCss) continue;

        // Compare elements
        let i;
        for (i = 0; i < elements.length; i++) {
            let e1 = elements[i];
            let e2 = bundle.elements[i];

            if (!e1.file || !e2.file) break;
            if (e1.file !== e2.file) break;
        }

        // If all elements passed
        if (i === elements.length) return bundle;
    }
    
    return null;
}

exports.processCssElements = processCssElements;
exports.handleCssFile = handleCssFile;