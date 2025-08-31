const path = require('path');
const fs = require('fs-extra');
const now = require('performance-now');
const assert = require('assert');

const fileUtils = require('./file_utils.js');
const util = require('./util.js');
const markup = require('./markup.js');
const options = require('./options.js');
const style = require('./style.js');
const scripts = require('./scripts.js');

class Bundle {
    constructor(file, elements, options) {
        this.file = file;
        this.elements = elements;
        this.options = options; // The bundler options with which this bundle was created (can be different from markup to markup)
    }

    getVirtualState() {
        return this.file.ignored;
    }

    setVirtualState(state, force = false) {
        // Forbid changing it from a non-virtual state to a virtual state. Only the other direction is allowed!
        if (!force) assert(this.getVirtualState() === true || state === false);

        this.file.ignored = state;
    }

    getCode() {
        return this.file.contentOverride;
    }

    codeMatches(code) {
        return this.getCode() === code;
    }
}

// Represents one bundling process
class Bundler {
    constructor(optionsOverride) {
        this.options = new options.BundlerOptions(optionsOverride);
        this.root = new fileUtils.Directory(null, null, this);
        this.bundleDirectory = this.root.createSubdirectory('bundles');
        this.bundles = [];
        this.srcPathArray = this.options.src.split(path.sep); // An array describing the path to the src folder
        this.necessaryModuleFiles = new Set();
    }

    log(text, force = false) {
        if (this.options.verbose || force) console.log('[Sarcina] ' + text);
    }

    async run() {
        try {
            let start = now();
            let elapsed;

            this.log("Starting bundling process...\n\n\tSource directory:\n\t" + this.options.src + '\n\n\tTarget directory:\n\t' + this.options.dist + '\n');
    
            this.log("Constructing file tree...");
            fileUtils.constructFileTree(this.options.src, this.root);

            this.log("Processing files...");
            let individuallyHandledFiles = []; // CSS and JS files to be handeled individually
            await processDirectory(this.root, this, individuallyHandledFiles);
            await processIndividualFiles(individuallyHandledFiles, this);

            this.log("Cleaning up...");
            this.root.cleanseFiles();
            if (this.options.removeEmptyDirectories) this.root.cleanseDirectories();

            elapsed = now() - start;
            this.log("Bundle generation took " + (elapsed / 1000).toFixed(3) + ' seconds.');

            this.log("Writing files...");
            this.writeToDist();
    
            elapsed = now() - start;
            this.log("Bundling successful. Took " + (elapsed / 1000).toFixed(3) + " seconds.");
    
            return { success: true, error: null };
        } catch (e) {
            this.log("ERROR", true);
            console.error(e);
    
            return { success: false, error: e }
        }
    }

    createBundle(extension, elements, code, isVirtual = false, options) {
        // Searches for a bundle with matching code, which is then considered equal
        for (let b of this.bundles) {
            if (b.codeMatches(code)) return b;
        }
    
        let bundleFile = this.bundleDirectory.createFile(this.generateNextBundleName(extension) + extension);
        bundleFile.contentOverride = code;
    
        let bundle = new Bundle(bundleFile, elements, options);
        bundle.setVirtualState(isVirtual, true); // Virtual bundles won't be written to disk, but are only used internally
        this.bundles.push(bundle);
    
        this.log(`Created${isVirtual? " virtual": ""} bundle "${bundleFile.name}".`);
    
        return bundle;
    }

    // Returns either a random hex string or an int, depending on option
    generateNextBundleName(extension) {
        if (this.options.randomBundleNames) {
            let index = null
            let name;

            while (index !== -1) {
                name = util.generateRandomHexString();
                index = this.bundles.findIndex((a) => a.file.name.indexOf(name) === 0);
            }
    
            return name;
        }

        return this.countBundlesWithExtension(extension);
    }

    countBundlesWithExtension(extension) {
        let count = 0;

        for (let b of this.bundles) {
            if (b.file.extension === extension) count++;
        }

        return count;
    }

    // Writes the dist folder to disk
    writeToDist() {
        this.log('Creating "dist" folder...');
        fs.removeSync(this.options.dist);
        fs.mkdirSync(this.options.dist);
    
        this.root.write(this.options.dist);
    }
}

// Recursively scans the directory for files to process
async function processDirectory(directory, bundler, individuallyHandledFiles) {
    for (let file of directory.files) {
        if (file === bundler.bundleDirectory) continue;

        let relativePath = file.getRelativePath();
        if (bundler.options.pathIsIgnored(relativePath)) continue;

        if (file.constructor === fileUtils.File) {
            if (fileUtils.isMarkupFile(file)) { // If HTML or PHP
                await markup.processMarkup(file, bundler);
            } else if (fileUtils.isCssFile(file)) { // If CSS
                individuallyHandledFiles.push(file);
            } else if (fileUtils.isScriptFile(file)) { // If JS
                individuallyHandledFiles.push(file);
            }
        } else if (file.constructor === fileUtils.Directory) {
            await processDirectory(file, bundler, individuallyHandledFiles);
        }
    }
}

async function processIndividualFiles(files, bundler) {
    for (let file of files) {
        if (fileUtils.isCssFile(file)) { // If CSS
            if (bundler.options.cssFileShouldBeHandled(file)) {
                await style.handleCssFile(file, bundler);
            }
        } else if (fileUtils.isScriptFile(file)) { // If JS
            // This variable keeps track of if this file has already been handled normally, so not as a module. If so, disallow it being handled again as a module (would cause clashing).
            let scriptFileHandled = false;

            if (bundler.options.scriptFileShouldBeHandled(file)) {
                await scripts.handleScriptFile(file, bundler);
                scriptFileHandled = true;
            }
            if (bundler.options.moduleFileShouldBeHandled(file)) {
                if (scriptFileHandled) {
                    throw new Error(`Can't process script file "${relativePath}" as module because it has already been processed as a regular script file.`);
                }

                await scripts.handleModuleFile(file, bundler);
            };
        } 
    }
}

exports.Bundler = Bundler;