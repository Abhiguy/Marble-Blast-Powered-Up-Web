const htmlMinify = require('html-minifier').minify;

// Represents a general HTML element, with attributes and body and such.
// It is specified at the top, because circular dependencies are mean to solve.
class HtmlElement {
    constructor(data, markupProcessData) {
        this.index = data.index;
        this.tagName = data.tagName;
        this.string = data.string;
        this.openingTag = data.openingTag;
        this.body = data.body;
        this.attributes = new HtmlElementAttributeList(this.openingTag);
        this.markupProcessData = markupProcessData;
    }

    // Get the indexes that one would need to cut in order to remove the element from the markup. Including whitespace, or not.
    getCutBounds(cutLineIfEmpty = true) {
        let start = this.index;
        let end = start + this.string.length;

        if (cutLineIfEmpty) {
            let linebreakBefore = util.getLinebreakBefore(this.markupProcessData.contents, start);
            let linebreakAfter = util.getLinebreakAfter(this.markupProcessData.contents, end);

            // If the line is empty
            if (linebreakBefore.empty && linebreakAfter.empty) {
                start = linebreakBefore.newLineIndex;
                end = linebreakAfter.newLineIndex;
            }
        }

        return { start, end };
    }
}
exports.HtmlElement = HtmlElement;

const fileUtils = require('./file_utils.js');
const style = require('./style.js');
const scripts = require('./scripts.js');
const util = require('./util.js');
const options = require('./options.js');

async function processMarkup(file, bundler) {
    bundler.log(`Processing "${file.getRelativePath()}"...`);
    
    let markupProcessData = new MarkupProcessData(file, bundler);

    // This has to be done to unify line removal
    markupProcessData.contents = util.replaceCRLFwithLF(markupProcessData.contents);
    markupProcessData.updateExclusionRanges();

    await style.processCssElements(markupProcessData);
    await scripts.processScriptElements(markupProcessData);
    if (markupProcessData.options.minifyMarkup) minifyMarkup(markupProcessData);

    file.contentOverride = markupProcessData.contents;
}

// An exclusion range specifies an additional region in markup to be treated as empty, because it is either a comment or a PHP block.
class ExclusionRange {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    isInside(index) {
        return index >= this.start && index < this.end;
    }
}

// Stores data about the current markup being processed
class MarkupProcessData {
    constructor(file, bundler) {
        this.file = file;
        this.contents = this.file.getRawContents();
        this.bundler = bundler;
        this.exclusionRanges = [];
        this.options = this.bundler.options; 
        this.options = options.getOverriddenOptionsIfPossible(this.options, this.file, this.options.markupOptionOverride); // The options local to this markup file
    }

    // Returns whether or not an index lies inside an excluded range
    isExcludedIndex(index) {
        for (let exclusionRange of this.exclusionRanges) {
            if (exclusionRange.isInside(index)) return true;
        }

        return false;
    }

    // For debug:
    logExcludedRanges() {
        for (let exclusionRange of this.exclusionRanges) {
            console.log(this.contents.slice(exclusionRange.start, exclusionRange.end));
        }
    }

    updateExclusionRanges() {
        this.exclusionRanges.length = 0;

        if (fileUtils.isPHPFile(this.file)) this.excludePhpBlocks();
        this.excludeHtmlComments();
    }

    // Adds exclusion ranges based on PHP blocks
    excludePhpBlocks() {
        // Separated into start and end regexes, because it's not guaranteed that the block is properly closed

        let phpBlockStartRegEx = /(<\?php|<\?=)/gi;
        let phpBlockEndRegEx = /\?>/g;
        let match;
    
        while ((match = phpBlockStartRegEx.exec(this.contents)) !== null) {
            let start = match.index;
            let end;
    
            if (this.isExcludedIndex(start)) continue;
    
            phpBlockEndRegEx.lastIndex = start + match[0].length;
            let endMatch = phpBlockEndRegEx.exec(this.contents);
    
            if (endMatch) {
                end = endMatch.index + endMatch[0].length;
            } else {
                // If the tag is not closed, it continues to the end of the file
                end = this.contents.length;
            }
            phpBlockStartRegEx.lastIndex = end;
    
            this.exclusionRanges.push(new ExclusionRange(start, end));
        }
    }

    // Adds exclusion ranges based on HTML comments
    excludeHtmlComments() {
        // Separated into start and end regexes, because it's not guaranteed that the comment is properly closed

        let htmlCommentStartRegEx = /<!--/g;
        let htmlCommentEndRegEx = /-->/g;
        let match;
    
        while ((match = htmlCommentStartRegEx.exec(this.contents)) !== null) {
            let start = match.index;
            let end;
    
            if (this.isExcludedIndex(start)) continue;
    
            htmlCommentEndRegEx.lastIndex = start + match[0].length;
            let endMatch = htmlCommentEndRegEx.exec(this.contents);
    
            if (endMatch) {
                end = endMatch.index + endMatch[0].length;
            } else {
                // If the comment is not closed, it continues to the end of the file
                end = this.contents.length;
            }
            htmlCommentStartRegEx.lastIndex = end;
    
            this.exclusionRanges.push(new ExclusionRange(start, end));
        }
    }

    // Test if text in range is only whitespace or excluded
    isEmptyInRange(start, end, additionalExclusionRanges = []) { 
        for (let index = start; index < end; index++) {
            let char = this.contents.charAt(index);

            if (util.isWhitespace(char)) continue;
            if (this.isExcludedIndex(index)) continue;
            if (additionalExclusionRanges.find((a) => a.isInside(index))) continue;

            return false;
        }

        return true;
    }

    // Gets the indexes for things like END_OF_HEAD or START_OF_BODY, specified in targetData
    getIndexByInsertTargetData(targetData) {
        let tagName;
        switch (targetData.element) {
            case 'head': tagName = 'head'; break;
            case 'body': tagName = 'body'; break;
            case 'document': tagName = 'html'; break;
            case 'file' : {
                if (targetData.position === 'start') return 0;
                else return this.contents.length;
            };
        }

        // Regex for the opening/closing tag
        let regExp = new RegExp('<' + ((targetData.position === 'start')? '' : '/') + tagName + '(?: (?:.|\s)*?)?>', 'gi');
        let index, match;

        while ((match = regExp.exec(this.contents)) !== null) {
            if (!this.isExcludedIndex(match.index)) {
                index = match.index;
                break;
            }
        }

        if (index === undefined) {
            let nextElement;
            if (tagName === 'head' || tagName === 'body') nextElement = 'document';
            else if (tagName === 'html') nextElement = 'file';

            this.bundler.log('WARNING: ' + targetData.position + ' of ' + targetData.element + ' was not found. Trying to insert at ' + targetData.position + ' of ' + nextElement + ' instead.', true);
            
            // Call it again recursively, hoping to find something
            return this.getIndexByInsertTargetData({element: nextElement, position: targetData.position});
        }

        if (targetData.position === 'start') index += match[0].length;
        return index;
    }
}

function minifyMarkup(markupProcessData) {
    markupProcessData.bundler.log(`Minifying "${markupProcessData.file.getRelativePath()}"...`);

    markupProcessData.contents = htmlMinify(markupProcessData.contents, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true
    });
}

class HtmlElementAttributeList {
    constructor(elementOpeningTag) {
        this.attributes = {};
        
        if (elementOpeningTag) this.parse(elementOpeningTag);
    }

    parse(elementOpeningTag) {
        let attributeRegEx = / ([\w\d-:.]+)(?:="(.*?)"|='(.*?)')?/gi;
        let match;

        while ((match = attributeRegEx.exec(elementOpeningTag)) !== null) {
            let attributeName = match[1];
            let attributeValue = match[2];
            if (!attributeValue) attributeValue = match[3];

            this.attributes[attributeName] = attributeValue;
        }
    }

    set(attributeName, attributeValue) {
        this.attributes[attributeName] = attributeValue;
    }

    remove(attributeName) {
        delete this.attributes[attributeName];
    }

    has(attributeName, attributeValue = undefined) {
        if (attributeValue) {
            return this.attributes[attributeName] === attributeValue;
        }

        // Also returns true for undefined values
        return this.attributes.hasOwnProperty(attributeName);
    }

    get(attributeName) {
        return this.attributes[attributeName];
    }

    toString() {
        let str = '';

        for (let attributeName in this.attributes) {
            let attributeValue = this.attributes[attributeName];

            str += ' ' + attributeName;
            if (attributeValue !== undefined) str += `="${attributeValue}"`;
        }

        return str;
    }

    clone() {
        let clone = new HtmlElementAttributeList();

        for (let attributeName in this.attributes) {
            let attributeValue = this.attributes[attributeName];
            clone.set(attributeName, attributeValue);
        }

        return clone;
    }
}

// Returns HtmlElements or subclasses thereof
function getAllElementsByTag(markupProcessData, tagDescription) {
    let constructor = tagDescription.constructor || HtmlElement;

    let regExpString = '(<' + tagDescription.name + '(?: (?:.|\\s)*?)?>)'; // Opening tag
    regExpString += '((?:.|\\s)*?)'; // Body
    if (tagDescription.hasClosingTag) regExpString += '</' + tagDescription.name + '(?: (?:.|\\s)*?)?>'; // Closing tag

    let regExp = new RegExp(regExpString, 'gi');
    let match;
    let elements = [];

    while ((match = regExp.exec(markupProcessData.contents)) !== null) {
        if (markupProcessData.isExcludedIndex(match.index)) continue;

        let newElement = new constructor({
            index: match.index,
            tagName: tagDescription.name,
            string: match[0],
            openingTag: match[1],
            body: match[2]
        }, markupProcessData);
        elements.push(newElement);
    }

    return elements;
}

function createHtmlElementString(tagName, hasClosingTag = false, attributes, body) {
    let elementStr = '<' + tagName;
    if (attributes) elementStr += attributes.toString();
    elementStr += '>';

    if (hasClosingTag) {
        if (body) elementStr += body;
        elementStr += `</${tagName}>`;
    }

    return elementStr;
}

exports.processMarkup = processMarkup;
exports.HtmlElementAttributeList = HtmlElementAttributeList;
exports.getAllElementsByTag = getAllElementsByTag;
exports.ExclusionRange = ExclusionRange;
exports.createHtmlElementString = createHtmlElementString;