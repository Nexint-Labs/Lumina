const fs = require("node:fs");
const path = require("node:path");
const { root, frameworkDir, standalone } = require("./dirs");

/**
 * get config for the framework lol
 * @param {String} name
 * @returns {Object}
 */
const getConfig = function (name) {

    const frameworkPath = path.join(frameworkDir, "config", `${name}.js`);

    const appPath = path.join(root, "config", `${name}.js`);

    let config = {};

    if (fs.existsSync(frameworkPath)) {
        config = require(frameworkPath);
    }

    if (!standalone && fs.existsSync(appPath)) {
        config = {
            ...config,
            ...require(appPath)
        };
    }

    return config;
}

module.exports = { getConfig };