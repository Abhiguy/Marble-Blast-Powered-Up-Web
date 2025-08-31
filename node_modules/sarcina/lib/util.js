const stableSort = require('stable');

const LESS_THAN_SIGN_UNICODE = '\\u003c';

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function objectsAreEqual(o1, o2) {
    return JSON.stringify(o1) === JSON.stringify(o2);
}

function stringCutout(str, start, end) {
    return str.slice(0, start) + str.slice(end);
}

function isWhitespace(char) {
    return char === ' ' || char === '\n' || char === '\t' || char === '\r';
}

// If 'index' is inside a whitespace-only line, remove that line and return the edited string. Otherwise, return the original string.
function removeLineIfEmpty(str, index) { // "empty" meaning whitespace-only
    let linebreakBefore = getLinebreakBefore(str, index);
    let linebreakAfter = getLinebreakAfter(str, index);

    if (!linebreakBefore.empty || !linebreakAfter.empty) return str;

    return stringCutout(str, linebreakBefore.newLineIndex, linebreakAfter.newLineIndex);
}

function indexIsInsideEmptyLine(str, index) { // "empty" meaning whitespace-only
    return getLinebreakBefore(str, index).empty && getLinebreakAfter(str, index).empty;
}

// Get the first \n before a given index
function getLinebreakBefore(str, startingIndex) {
    let index;
    let empty = true; // If, inbetween the linebreak and the starting index, there is nothing but whitespace

    for (index = startingIndex - 1; index >= 0; index--) {
        let char = str.charAt(index);

        if (!isWhitespace(char)) empty = false;
        if (char === '\n') break;
    }

    return { empty, newLineIndex: index };
}

// Get the first \n after a given index
function getLinebreakAfter(str, startingIndex) {
    let index;
    let empty = true; // If, inbetween the linebreak and the starting index, there is nothing but whitespace

    for (index = startingIndex; index < str.length; index++) {
        let char = str.charAt(index);

        if (!isWhitespace(char)) empty = false;
        if (char === '\n') break; // Line break is reached
    }

    return { empty, newLineIndex: index };
}

function stringInsertAt(string, index, substring) {
    return string.slice(0, index) + substring + string.slice(index);
}

const ABSOLUTE_URL_REGEXP = new RegExp('^(?:[a-z]+:)?//', 'i');
// Determine if a URL is absolute, aka non-local. http://google.com/ is absolute, ./js/index.js is not.
function urlIsAbsolute(url) {
    return ABSOLUTE_URL_REGEXP.test(url);
}

function generateRandomHexString(len = 12) {
    let output = '';
    for (let i = 0; i < len; i++) {
        output += (Math.floor(Math.random() * 16)).toString(16);
    }

    return output;
}

// Helper class to help with cutting strings and inserting substrings into strings. This class will perform those operations in the right order based on their index. It does this by processing all instructions with the highest index first, then moving down to lower indexes. This avoids shifting other indexes around.
class StringSplicer {
    constructor(string) {
        this.string = string;
        this.instructions = [];
    }

    addCut(index, length) {
        this.instructions.push({
            type: 'cut',
            index: index,
            length: length
        });
    }

    addInsert(index, substring) {
        this.instructions.push({
            type: 'insert',
            index: index,
            substring: substring
        });
    }

    execute() {
        let result = this.string;

        // Put all the cuts first
        this.instructions.sort((a, b) => {
            if (a.type === 'cut') return -1;
            else return 1;
        });

        // Sort by index, in descending order. It is important that this sort is stable.
        stableSort.inplace(this.instructions, (a, b) => {
            return b.index - a.index;
        });

        for (let instruction of this.instructions) {
            switch (instruction.type) {
                case 'cut':
                    result = stringCutout(result, instruction.index, instruction.index + instruction.length);
                    break;
                case 'insert':
                    result = stringInsertAt(result, instruction.index, instruction.substring);
                    break;
                default: break;
            }
        }

        return result;
    }
}

// Replaces the \r\n (carriage-return, line-feed) Windows line ending with just \n
function replaceCRLFwithLF(string) {
    return string.replace(/\r\n/g, '\n');
}

// Plain objects are just {}-y objects. Not null, not arrays, just... objects. JavaScript is weird sometimes.
function isPlainObject(input){
    return input && !Array.isArray(input) && typeof input === 'object';
}

// Kinda like an Array.includes
function objectHasValue(object, value) {
    for (let key in object) {
        if (object[key] === value) {
            return true;
        }
    }

    return false;
}

exports.LESS_THAN_SIGN_UNICODE = LESS_THAN_SIGN_UNICODE;
exports.cloneObject = cloneObject;
exports.objectsAreEqual = objectsAreEqual;
exports.stringCutout = stringCutout;
exports.isWhitespace = isWhitespace;
exports.stringInsertAt = stringInsertAt;
exports.urlIsAbsolute = urlIsAbsolute;
exports.generateRandomHexString = generateRandomHexString;
exports.StringSplicer = StringSplicer;
exports.getLinebreakBefore = getLinebreakBefore;
exports.getLinebreakAfter = getLinebreakAfter;
exports.replaceCRLFwithLF = replaceCRLFwithLF;
exports.indexIsInsideEmptyLine = indexIsInsideEmptyLine;
exports.removeLineIfEmpty = removeLineIfEmpty;
exports.isPlainObject = isPlainObject;
exports.objectHasValue = objectHasValue;