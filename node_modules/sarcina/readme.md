[![npm version](https://img.shields.io/npm/v/sarcina.svg)](https://www.npmjs.com/package/sarcina)
# Sarcina

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Programmatic examples](#programmatic-examples)
5. [Options](#options)

# Overview
## What is it? And why?
Sarcina is as super-simple, zero-configuration and fast bundling tool, made to get your web projects ready for production. It is meant to be a works-out-of-the-box alternative to traditional bundlers like Webpack, whose complicated configuration is often overkill for most projects.

That said, Sarcina purposefully targets only *regular vanilla* non-framework web projects - in other words, projects that don't **need** to be built while working on them. In-development build tools usually add overhead to the development process, while simultaneously increasing project complexity. Sarcina is therefore intended to be run only when bundling a project for deployment, not constantly during development.

## What does it do?
At its core, Sarcina creates a production distribution folder by processing every markup file in a folder, parsing it for CSS and JavaScript elements, creating bundles using those files and re-inserting links to the bundles back into the markup. During this process, your HTML can be minified, your CSS minified and autoprefixed, and your JavaScript minified and transpiled.

The resulting folder has considerably less files and complexity, and is often much smaller in total size. Less and smaller files to load by the browser can improve the user experience drastically.

## An example
**Consider this source folder:**
```
src
│   index.html
│   about.html  
└───css
|   │   base.css
|   │   about.css
└───js
    │   main.js
    │   util.js
    │   about.js
    │   constants.js
```

```html
<!-- index.html -->
<html>
    <head>
        <title>Main Page</title>
        <link rel="stylesheet" href="css/base.css">
    </head>
    <body>
        <h1>Welcome!</h1>
        <script src="js/util.js"></script>
        <script src="js/main.js"></script>
    </body>
</html>

<!-- about.html -->
<html>
    <head>
        <title>About Page</title>
        <link rel="stylesheet" href="css/base.css">
        <link rel="stylesheet" href="css/about.css">
    </head>
    <body>
        <h1>About</h1>
        <p>This is a really dope page.</p>
        <script src="js/util.js"></script>
        <script src="js/main.js"></script>
        <script src="js/about.js" type="module"></script>
    </body>
</html>
```

```css
/* base.css */
body {
    background: blue;
    display: none;
}
h1 {
    font-size: 22px;
}

/* about.css */
p {
    color: white;
}
```

```javascript
// util.js
function showElement(element) {
    element.style.display = 'block';
}

// main.js
window.addEventListener('load', () => {
    console.log("Page loaded!");
    showElement(document.querySelector('body'));
});

// about.js
import { GOLDEN_RATIO } from './constants.js';
console.log("Oh, by the way, the golden ratio is " + GOLDEN_RATIO);

// constants.js
export const PI = Math.PI;
export const GOLDEN_RATIO = 1.61803398875;
```

**After running Sarcina on this source folder, we get the following distribution folder:**
```
dist
│   index.html
│   about.html  
└───bundles
    │   0.css
    │   1.css
    │   0.js
    │   1.js
```

```html
<!-- index.html -->
<html>
    <head>
        <title>Main Page</title>
        <link rel="stylesheet" href="bundles/0.css">
    </head>
    <body>
        <h1>Welcome!</h1>
        <script src="bundles/0.js"></script>
    </body>
</html>

<!-- about.html -->
<html>
    <head>
        <title>About Page</title>
        <link rel="stylesheet" href="bundles/1.css">
    </head>
    <body>
        <h1>About</h1>
        <p>This is a really dope page.</p>
        <script src="bundles/0.js"></script>
        <script src="bundles/1.js"></script>
    </body>
</html>
```

```css
/* 0.css */
body{background:blue;display:none;}h1{font-size:22px;}

/* 1.css */
body{background:blue;display:none;}h1{font-size:22px;}p{color:white;}
```

```javascript
// 0.js
function showElement(element){element.style.display='block'};window.addEventListener('load',function(){console.log("Page loaded!"),showElement(document.querySelector('body'))});

// 1.js
console.log("Oh, by the way, the golden ratio is "+1.61803398875);
```

Sarcina took all the source files, minified and bundled them, and re-inserted them into the HTML (which was left unminified for demonstration purposes). More specifically, `js/util.js` and `js/main.js` were bundled together into `bundles/0.js`,while the ES6 Modules in `js/about.js` were automatically resolved by Sarcina and bundled into `bundles/1.js`. In `index.html`, `css/base.css` was bundled on its own, while in `about.html`, it was bundled with `css/about.css`.

---

# Installation
Sarcina is used programatically. Simply require it using Node:
```javascript
const sarcina = require('sarcina');
```
# Usage
Sarcina has only one, core method:
## sarcina.bundle([options])
- `options` A configuration object. [See the list of options.](#options)

**Returns**: A promise resolving to an object once bundling is complete. This object contains the boolean property `success`, indicating if the bundling succeeded, and the property `error`, which is `null` if there was none.

# Programmatic examples
In the following example, the folder `input` is bundled into the folder `output`, and the success of the operation is printed:
```javascript
sarcina.bundle({
    src: 'path/to/input',
    dist: 'path/to/output'
}).then((result) => console.log(result.success));
```
We might want to inject our bundled styles and scripts directly into our markup:
```javascript
sarcina.bundle({
    src: 'path/to/input',
    dist: 'path/to/output',
    injectCss: true,
    injectScript: true
}).then((result) => console.log(result.success));
```
Here, we choose to bundle not to bundle any CSS:
```javascript
sarcina.bundle({
    src: 'path/to/input',
    dist: 'path/to/output',
    bundleCss: false
}).then((result) => console.log(result.success));
```
We might want to support older JavaScript versions, but also still want to be able to read the resulting script:
```javascript
sarcina.bundle({
    src: 'path/to/input',
    dist: 'path/to/output',
    transpileScript: sarcina.ES3,
    minifyScript: false
}).then((result) => console.log(result.success));
```
Our folder might contain files only meant for development, so we choose to ignore those:
```javascript
sarcina.bundle({
    src: 'path/to/input',
    dist: 'path/to/output',
    ignore: ['test', '*.sh', 'assets/audio/*.wav']
}).then((result) => console.log(result.success));
```
# Options

The following options can be used to configure a bundling process:

### General options
Name | Default | Description
--- | --- | ---
`src` | `./src` | The path to the input directory.
`dist` | `./dist` | The path to the output directory. This directory will be deleted and recreated on every run.
`minifyMarkup` | `true` | When set to `true`, HTML will be minified.
`randomBundleNames` | `true` | When set to `true`, bundles will be given random hexadecimal names. Otherwise, they will be numbered.

### CSS-related options
Name | Default | Description
--- | --- | ---
`bundleCss` | `true` | When set to `true`, CSS will be bundled.
`cssInsertPosition` | `sarcina.END_OF_HEAD` | Specifies the position in which CSS bundles will be inserted into the markup. Can be:<br><br>`sarcina.LOCAL` - Bundles will be inserted approximately where the elements they bundled once were. You should choose this if you want to leave the relative position to other HTML elements unchanged. This option is not reommended for CSS.<br>`sarcina.START_OF_HEAD` - Bundles will be inserted right after the opening `<head>` tag.<br>`sarcina.END_OF_HEAD` - Bundles will be inserted right before the closing `</head>` tag. **In almost all cases, this is where your styles should be.**<br>`sarcina.START_OF_BODY` - Bundles will be inserted right after the opening `<body>` tag.<br>`sarcina.END_OF_BODY` - Bundles will be inserted right before the closing `</body>` tag.<br>`sarcina.START_OF_DOCUMENT` - Bundles will be inserted right after the opening `<html>` tag.<br>`sarcina.END_OF_DOCUMENT` - Bundles will be inserted right before the closing `</html>` tag.<br>`sarcina.START_OF_FILE` - Bundles will be inserted at the very start of the file.<br>`sarcina.END_OF_FILE` - Bundles will be inserted at the very end of the file.
`minifyCss` | `true` | When set to `true`, CSS will be minified.
`optimizeCss` | `false` | When set to `true`, CSS will be optimized using CleanCSS.
`autoprefixCss` | `false` | When set to `true`, vendor prefixes will be automatically added to the CSS using PostCSS and Autoprefixer to achieve wider browser support.
`handleInlineCss` | `true` | Specifies whether or not inline CSS (that inbetween `<style>` tags) will be included by the bundler.
`injectCss` | `false` | When set to `true`, CSS will not be put into seperate files but instead be directly injected into the markup.
`sanitizeInjectedCss` | `true` | Replace certain characters in the injected CSS with their unicode representation in order to prevent broken HTML. There's no real reason to turn this off.
`cssFileAction` | `sarcina.KEEP_NECESSARY` | Specifies what to do with .css files found in the input directory. Can be:<br><br>`sarcina.REMOVE_ALL` - Copy no CSS files into the output directory.<br>`sarcina.REMOVE_BUNDLED` - Copy only those CSS files into the output directory that have not been included in any bundle.<br>`sarcina.KEEP_NECESSARY` - Keep all files that are listed in the `handleCssFiles` option. If `bundleCss` is set to `false`, also keep all the files that are included in the markup.<br>`sarcina.KEEP_ALL` - Copy all CSS files into the output directory.
`missingCssFileTagAction` | `sarcina.KEEP` | Specifies the action taken with `<link>` tags that point to a local file which doesn't exist. Can be:<br><br>`sarcina.KEEP` - Keep the tags, but don't process them.<br>`sarcina.REMOVE` - Remove the tags.
`handledCssFiles` | [] | Specifies a list of CSS files to be processed and replaced, independent of any markup - for example, if you wanted to minimize every file individually. Can be:<br><br>- An array of [Globs](https://en.wikipedia.org/wiki/Glob_(programming)), specifying all affected files<br>- `'all'` - Process every file<br>- `'necessary'` - Process all files included in the markup

### Script-related options
Name | Default | Description
--- | --- | ---
`bundleScript` | `true` | When set to `true`, scripts will be bundled.
`scriptInsertPosition` | `sarcina.LOCAL` | Specifies the position in which JS bundles will be inserted into the markup. Can be:<br><br>`sarcina.LOCAL` - Bundles will be inserted approximately where the elements they bundled once were. You should choose this if you want to leave the relative position to other HTML elements unchanged. **This option is by far the best for scripts, as their relative position within the markup can play a vital role**.<br>`sarcina.START_OF_HEAD` - Bundles will be inserted right after the opening `<head>` tag.<br>`sarcina.END_OF_HEAD` - Bundles will be inserted right before the closing `</head>` tag.<br>`sarcina.START_OF_BODY` - Bundles will be inserted right after the opening `<body>` tag.<br>`sarcina.END_OF_BODY` - Bundles will be inserted right before the closing `</body>` tag.<br>`sarcina.START_OF_DOCUMENT` - Bundles will be inserted right after the opening `<html>` tag.<br>`sarcina.END_OF_DOCUMENT` - Bundles will be inserted right before the closing `</html>` tag.<br>`sarcina.START_OF_FILE` - Bundles will be inserted at the very start of the file.<br>`sarcina.END_OF_FILE` - Bundles will be inserted at the very end of the file.
`minifyScript` | `true` | When set to `true`, scripts will be minified using UglifyES.
`transpileScript` | `false` | This option allows automatic transpilation of the JavaScript to earlier versions for increased browser support. Can be:<br><br>`false` - Don't transpile.<br>`true` - Transpile to ES5.<br>`sarcina.ES3` - Transpile to ES3.<br>`sarcina.ES5` - Transpile to ES5.<br>`sarcina.ES6`/`sarcina.ES2015` - Transpile to ES6.<br>`sarcina.ES2016` - Transpile to ES2016.<br>`sarcina.ES2017` - Transpile to ES2017.<br>`sarcina.ESNEXT` - Transpile to ESNext.
`iifeScript` | `false` | When set to `true`, every bundle will be wrapped in an [IIFE](https://en.wikipedia.org/wiki/Immediately_invoked_function_expression). This can be done to prevent globals from being created. This can be the desired outcome, however it could also break the interactions between multiple bundles that depend on their global variables.
`insertPolyfill` | `false` | When set to `true`, a [Polyfill.io](https://cdnjs.cloudflare.com/polyfill/v3/) (not the Chinese version 💀) script will be inserted at the beginning of the `<head>` element. This script will read the browser's user agent string and intelligently include polyfills. Note that this insertion takes place regardless of the value of the `bundleScript` option.
`handleInlineScript` | `true` | Specifies whether or not inline JavaScript (that inbetween `<script>` tags) will be included by the bundler.
`injectScript` | `false` | When set to `true`, scripts will not be put into seperate files but instead be directly injected into the markup.
`sanitizeInjectedScript` | `true` | Replace certain characters in the injected script with their unicode representation in order to prevent broken HTML. There's no real reason to turn this off.
`scriptFileAction` | `sarcina.KEEP_NECESSARY` | Specifies what to do with .js files found in the input directory. Can be:<br><br>`sarcina.REMOVE_ALL` - Copy no JS files into the output directory.<br>`sarcina.REMOVE_BUNDLED` - Copy only those JS files into the output directory that have not been included in any bundle.<br>`sarcina.KEEP_NECESSARY` - Keep all files that are listed in the `handleScriptFiles` and `handleModuleFiles` option, aswell as all async scripts. If `bundleScript` is set to `false`, also keep all files that are included in the markup.<br>`sarcina.KEEP_ALL` - Copy all JS files into the output directory.
`missingScriptFileTagAction` | `sarcina.KEEP` | Specifies the action taken with `<script` tags that point to a local file which doesn't exist. Can be:<br><br>`sarcina.KEEP` - Keep the tags, but don't process them.<br>`sarcina.REMOVE` - Remove the tags.
`uglifyOptionsOverride` | `null` | An object, which can be used to override the default UglifyES settings, used for JavaScript minification.
`handledScriptFiles` | [] | Specifies a list of script files to be processed and replaced, independent of any markup - for example, if you wanted to minimize and transpile every file individually. Can be:<br><br>- An array of [Globs](https://en.wikipedia.org/wiki/Glob_(programming)), specifying all affected files<br>- `'all'` - Process every file<br>- `'necessary'` - Process all files included in the markup
`handledModuleFiles` | [] | Like `handledScriptFiles`, but it treats every file like an entry point to a ES6 module. `all` is not an option here.

### File-related options
Name | Default | Description
--- | --- | ---
`removeEmptyDirectories` | `true` | Whether or not empty directories should be removed. A directory is considered empty if it or its subdirectories contain no files.
`keep` | `[]` | An array containing [Globs](https://en.wikipedia.org/wiki/Glob_(programming)), specifying files and directories to be kept. Can be used to override certain automatic file deletion rules. Files listed in `keep` take precedence over `ignore`.
`ignore` | `[]` | An array containing [Globs](https://en.wikipedia.org/wiki/Glob_(programming)), specifying files and directories to be ignored and not copied.
`ignoreGit` | `true` | When set to `true`, `.git` and `.gitignore` will be ignored.
`ignoreDsStore` | `true` | When set to `true`, DSStore files created by macOS will be ignored.

### Other options
Name | Default | Description
--- | --- | ---
`verbose` | `false` | When set to `true`, sarcina will constantly print the process of the bundling process.
`markupOptionOverride` | {} | An object where its keys are [Globs](https://en.wikipedia.org/wiki/Glob_(programming)) and its values are a subset of options from this list, which are then used to override the options for a given markup file matching the glob. This can be used to override/change options for specific markup files, for example when we want leave one file un-minified.
`individuallyHandledFilesOptionOverride` | {} | Same as `markupOptionOverride`, but instead can be used to target individually-handled files specified in `handledCssFiles`, `handledScriptFiles` and `handledModuleFiles`. Example: We might want to wrap all our bundles in IIFEs, but not individual JavaScript files. Hence, we would use this option and set `iifeScript` to `false` for all JavaScript files.