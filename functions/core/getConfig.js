const fs = require("node:fs");
const path = require("node:path");
const { root, frameworkDir, standalone } = require("./dirs");

/**
 * @overload
 * @param {"core/core"} name
 * @returns {typeof import("../../config/core/core")}
 */

/**
 * @overload
 * @param {"core/log"} name
 * @returns {typeof import("../../config/core/log")}
 */

/**
 * @overload
 * @param {"cosmetic/config"} name
 * @returns {typeof import("../../config/cosmetic/config")}
 */

/**
 * @overload
 * @param {string} name
 * @returns {Record<string, any>}
 */

/**
 * Get configuration with application overrides.
 * @param {string} name
 * @returns {any}
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