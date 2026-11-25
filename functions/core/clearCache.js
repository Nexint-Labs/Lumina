const { getConfig } = require("#functions/core/getConfig");
const { verbose } = getConfig("core/core");
const path = require("node:path");
const { log } = require("./log.mjs");

/**
 * clear directory lol
 * @param {String} dir 
 * @param {String} Root
 * @returns 
 */
const clearDirectory = function (dir, root = process.cwd()) {
    let cleared = 0;

    for (const filename of Object.keys(require.cache)) {
        const relative = path.relative(root, filename);

        if (relative.startsWith(dir + path.sep)) {
            delete require.cache[filename];

            if (verbose) {
                log.info(`Deleted cache for ${filename}`)
            }

            cleared += 1;
        }
    }

    return cleared;
}

module.exports = {
    clearDirectory
}