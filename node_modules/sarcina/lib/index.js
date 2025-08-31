/*
    Sarcina v1.7.5
    @Vanilagy
*/

const bundler = require('./bundler.js');
const options = require('./options.js');

async function main(optionsOverride = {}) {
    let instance = new bundler.Bundler(optionsOverride);
    return instance.run();
}

exports.bundle = main;
for (let key in options.OptionConstants) {
    exports[key] = options.OptionConstants[key];
}