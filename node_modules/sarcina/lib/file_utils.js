const path = require('path');
const fs = require('fs-extra');
const copyFileSync = require('fs-copy-file-sync');

const options = require('./options.js');

// Base class used for Files and Directories
class FileBase {
    constructor(name = null, parent = null, bundler = null) {
        this.name = name;
        this.parent = parent;
        this.bundler = bundler;
        this.ignored = false;
        this.isNecessary = false;

        // To avoid re-computing these all the time
        this.absolutePathCache = null;
        this.relativePathCache = null;
    }

    // Returns an array describing its relative position in the file tree
    getFileTreePosition() {
        let path = [];

        if (this.parent && this.parent.parent) {
            path.unshift(this.parent.name);
            path.unshift(...this.parent.getFileTreePosition());
        }

        return path;
    }

    // Returns an array of directory objects (kind of identical to the method above, huh... :thinking:)
    getParentTree() {
        let arr = [];
        let current = this;

        while (current.parent) {
            arr.unshift(current.parent);
            current = current.parent;
        }

        return arr;
    }

    getAbsolutePath() {
        if (this.absolutePathCache !== null) return this.absolutePathCache;
        else return this.absolutePathCache = getAbsoluteFilePath(this.bundler.options.src, this);
    }

    getRelativePath() {
        if (this.relativePathCache !== null) return this.relativePathCache;
        else return this.relativePathCache = getRelativeFilePath(this);
    }
}

class File extends FileBase {
    constructor(name, parent, bundler) {
        super(name, parent, bundler);

        this.extension = path.extname(this.name).toLowerCase();
        this.rawContents = null;
        this.contentOverride = null;
        this.bundles = new Set(); // The bundles this file is a part of
    }

    // Read the file's contents from disk, or from cache if they've already been read
    getRawContents() {
        if (this.rawContents !== null) return this.rawContents;
        else return this.rawContents = fs.readFileSync(this.getAbsolutePath()).toString();
    }
}

class Directory extends FileBase {
    constructor(name, parent, bundler) {
        super(name, parent, bundler);

        this.files = [];
    }

    // Create a new directory and make it a child of this one
    createSubdirectory(name) {
        let newDirectory = new Directory(name, this, this.bundler);
        this.files.push(newDirectory);

        return newDirectory;
    }

    // Create a new file and make it a child of this directory
    createFile(name) {
        let newFile = new File(name, this, this.bundler);
        this.files.push(newFile);

        return newFile;
    }

    // Recursively traverses this directory. Based on the options, it sets files to be ignored, aka not to be written to disk.
    cleanseFiles() {
        for (let file of this.files) {
            // Skip if should be kept
            if (file === this.bundler.bundleDirectory || this.bundler.options.pathShouldBeKept(file.getRelativePath())) continue;

            if (file.constructor === File) {
                // If file is specified to be ignored
                if (this.bundler.options.pathIsIgnored(file.getRelativePath())) file.ignored = true;

                if (isCssFile(file)) {
                    // Handle CSS file action

                    switch (this.bundler.options.cssFileAction) {
                        case options.OptionConstants.REMOVE_ALL: {
                            file.ignored = true;
                        }; break;
                        case options.OptionConstants.REMOVE_BUNDLED: {
                            if (file.bundles.size > 0) file.ignored = true;
                        }; break;
                        case options.OptionConstants.KEEP_ALL: {
                            file.ignored = false;
                        }; break;
                        case options.OptionConstants.KEEP_NECESSARY: {
                            file.ignored = !file.isNecessary;
                        }; break;
                    }
                } else if (isScriptFile(file)) {
                    // Handle script file action

                    switch (this.bundler.options.scriptFileAction) {
                        case options.OptionConstants.REMOVE_ALL: {
                            file.ignored = true;
                        }; break;
                        case options.OptionConstants.REMOVE_BUNDLED: {
                            if (file.bundles.size > 0) file.ignored = true;
                        }; break;
                        case options.OptionConstants.KEEP_ALL: {
                            file.ignored = false;
                        }; break;
                        case options.OptionConstants.KEEP_NECESSARY: {
                            file.ignored = !file.isNecessary;
                        }; break;
                    }
                }
            } else if (file.constructor === Directory) {
                file.cleanseFiles();
            }
        }
    }

    // Removes empty child directories recursively. A directory is considered empty if it and its subdirectories contain zero files in total.
    cleanseDirectories() {
        let shouldCleanseMyself = false;
        if (this.getDeepFileCount() === 0) shouldCleanseMyself = true;

        for (let file of this.files) {
            if (file.constructor !== Directory) continue;
            let cleanse = file.cleanseDirectories();
            if (cleanse || this.bundler.options.pathIsIgnored(file.getRelativePath())) file.ignored = true;
        }

        return shouldCleanseMyself;
    }

    // Get the count of every file contained in this directory
    getDeepFileCount() {
        let total = 0;

        for (let file of this.files) {
            if (file.constructor === File && !file.ignored) total++;
            else if (file.constructor === Directory) total += file.getDeepFileCount();
        }

        return total;
    }

    // Write the contents of this directory to 'currentPath' on disk
    write(currentPath) {
        for (let file of this.files) {
            if (file.ignored) continue; // Don't write ignored files

            let destinationPath = path.join(currentPath, file.name);

            if (file.constructor === File) {
                this.bundler.log(`Writing file "${file.getRelativePath()}"...`);

                if (file.contentOverride !== null) {
                    // If custom content has been specified, write that
                    fs.writeFileSync(destinationPath, file.contentOverride);
                } else {
                    // Otherwise, perform a copy operation

                    let sourcePath = file.getAbsolutePath();

                    copyFileSync(sourcePath, destinationPath);
                }
            } else if (file.constructor === Directory) {
                this.bundler.log(`Creating directory "${file.getRelativePath()}"...`);

                fs.mkdirSync(destinationPath);
                file.write(destinationPath);
            }
        }
    }

    getRelativePath() {
        return getRelativeFilePath(this);
    }
}

function getAbsoluteFilePath(absoluteRootPath, file, isPosix = false) {
    let args = [absoluteRootPath, ...file.getFileTreePosition(), file.name || ''];

    if (isPosix) return path.posix.join(...args);
    else return path.join(...args);
}

// Relative to the src folder location
function getRelativeFilePath(file, isPosix = true) {
    let args = [...file.getFileTreePosition(), file.name || ''];

    if (isPosix) return path.posix.join(...args);
    else return path.join(...args);
}

// Like running a 'cd' command when inside a directory
function navigateFromDirectoryWithRelativePath(directory, relativePath) {
    let here = directory;
    let steps = relativePath.split(path.posix.sep);

    for (let step of steps) {
        switch (step) {
            case '..': {
                here = here.parent || here;
            }; break;
            case '.': {
                here = here; // Yes, I know this does nothing. It's all for that #clarity!
            }; break;
            default: {
                let index = here.files.findIndex((a) => a.name === step);
                if (index === -1) return null;
                else here = here.files[index];
            };
        }
    }

    return here;
}

// Get the shortest path from A to B, as a string. Works by finding the closest common ancestor and moving from there.
function getPathFromFileAToFileB(a, b) {
    let aParents = a.getParentTree();
    let bParents = b.getParentTree();
    let closestCommonAncestor;
    let wentBackSteps = 0;

    // Find the closest common ancestor
    outer:
    for (let i = aParents.length - 1; i >= 0; i--) {
        let aParent = aParents[i];

        for (let bParent of bParents) {
            if (bParent === aParent) {
                closestCommonAncestor = aParent;
                break outer;
            }
        }

        wentBackSteps++;
    }

    // Generate a ../../../-like string, based on how many directories one needs to go back from file A to hit the closest common ancestors
    let pathElements = [];
    if (wentBackSteps === 0) {
        pathElements.push('.');
    } else {
        for (let i = 0; i < wentBackSteps; i++) pathElements.push('..');
    }

    // Walk the path from the closest common ancestor to file B
    let index = bParents.findIndex((a) => a === closestCommonAncestor) + 1;
    let directory;
    while ((directory = bParents[index]) !== undefined) {
        pathElements.push(directory.name);
        index++;
    }

    pathElements.push(b.name);

    return pathElements.join(path.posix.sep);
}

// Reads all files and directories recursively and constructs an internal file tree based on that
function constructFileTree(directoryPath, directory) {
    let files = fs.readdirSync(directoryPath);
    
    for (let fileName of files) {
        let filePath = path.join(directoryPath, fileName);
        let fileStats = fs.lstatSync(filePath);

        if (fileStats.isDirectory()) {
            let newDirectory = directory.createSubdirectory(fileName);

            constructFileTree(filePath, newDirectory);
        } else {
            directory.createFile(fileName);
        }
    }
}

const MARKUP_EXTENSIONS = ['.html', '.htm', '.php'];
function isMarkupFile(file) {
    return MARKUP_EXTENSIONS.includes(file.extension);
}

function isCssFile(file) {
    return file.extension === '.css';
}

function isScriptFile(file) {
    return file.extension === '.js';
}

function isPHPFile(file) {
    return file.extension === '.php';
}

exports.constructFileTree = constructFileTree;
exports.File = File;
exports.Directory = Directory;
exports.isPHPFile = isPHPFile;
exports.isCssFile = isCssFile;
exports.isScriptFile = isScriptFile;
exports.isMarkupFile = isMarkupFile;
exports.navigateFromDirectoryWithRelativePath = navigateFromDirectoryWithRelativePath;
exports.getPathFromFileAToFileB = getPathFromFileAToFileB;