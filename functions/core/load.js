const fs = require("node:fs");
const path = require('path');
const { log } = require("./log.mjs");
const { getConfig } = require("#functions/core/getConfig");
const { verbose, errorPolicy } = getConfig("core/core");
const { forceShutdown } = require("./fatalShutdown.mjs");

/**
 * helper lol
 * @param {String} dir 
 * @param {Function} func 
 * @param {Object} [options]
 * @param {String} [options.root=process.cwd()]
 * @param {Boolean} [options.cachedOnly=false]
 * @param {Boolean} [options.fatal=true]
 * @param {String} [options.errorMessage]
 */
const loadDirHelper = async function (dir, func, { root = process.cwd(), cachedOnly = false, fatal = true, errorMessage = "Failed to load files." } = {}) {

    let success = true;

    const dirPath = path.join(root, dir);

    const files = fs.readdirSync(dirPath, { recursive: true });
    for (const file of files) {

        // Only load JS files (trust)
        if ([".js", ".cjs", ".mjs"].includes(path.extname(file).toLowerCase())) {
            const filePath = path.join(dirPath, file);

            // Execute the plugin?
            try {
                let plugin;

                // Load only pre-existing cached files.
                if (cachedOnly) {
                    const filename = require.resolve(filePath);
                    const cached = require.cache[filename];

                    if (!cached || !cached.loaded) continue;

                    plugin = cached.exports;
                } else {
                    plugin = require(filePath);
                }

                // good question
                if (await func(plugin, file) === true) {
                    return { success, stopped: true };
                }
            } catch (error) {
                success = false;

                if (errorPolicy.uncaughtException === "continue") {
                    continue;
                }

                log.error(errorMessage);
                log.error(`Problematic file: ${filePath}`, error);

                if (fatal && errorPolicy.uncaughtException !== "warn") {
                    await forceShutdown(errorMessage);
                }
            }
        }
    }

    return { success, stopped: false };
}

/**
 * Find files
 * This runs the execute function.
 * @param {String} dir 
 * @param {String} [root] - Defaults to the working directory.
 * @returns
 */
const queryFiles = async function (dir, root) {

    let count = 0;

    const queryHelper = (plugin) => {
        if ('execute' in plugin || 'command' in plugin) {
            count++;
        }
    }

    await loadDirHelper(dir, queryHelper, { root });

    return count;
}

/**
 * Load files in a specific directory.
 * This runs the execute function.
 * @param {String} dir 
 * @param {String} [root] - Defaults to the working directory.
 */
const load = async function (dir, root) {
    let count = 0;

    const loadHelper = async (plugin, file) => {
        if ('execute' in plugin && !('data' in plugin)) {
            await plugin.execute();
            count++;

            if (verbose) {
                log.info(`Loaded file: ${path.join(dir, file)}`);
            }
        }
    }

    await loadDirHelper(dir, loadHelper, { root });

    return count;
}

/**
 * Load console files
 * This runs the console function.
 * @param {String} dir 
 * @param {String} command 
 * @param {String} [root] - Defaults to the working directory.
 */
const loadConsole = async function (dir, command, root) {

    const loadConsoleHelper = async (plugin, file) => {
        if ('command' in plugin) {
            const validCommand = await plugin.command(command);

            if (verbose) {
                log.info(`Loaded file: ${path.join(dir, file)}`);
            }

            return Boolean(validCommand);
        }
    }

    const { stopped } = await loadDirHelper(dir, loadConsoleHelper, {
        root,
        errorMessage: "Failed to load console files."
    });

    return stopped;
}

/**
 * Load help menu.
 * This is meant to run dynamically.
 * @param {String} dir 
 * @param {String} [root] - Defaults to the working directory.
 */
const loadHelp = async function (dir, root) {
    let helpArray = [];

    const loadHelpHelper = async (plugin) => {
        if ('help' in plugin) {
            helpArray = helpArray.concat(await plugin.help());
        }
    }

    await loadDirHelper(dir, loadHelpHelper, {
        root,
        errorMessage: "Failed to load help menu."
    });

    return helpArray;
}

/**
 * Close everything (shut it all down) safely.
 * @param {String} dir 
 * @param {String} [root] - Defaults to the working directory.
 */
const close = async function (dir, root) {

    const closeHelper = async (plugin, file) => {
        if ('close' in plugin) {
            await plugin.close();

            if (verbose) {
                log.info(`Closed file: ${path.join(dir, file)}`);
            }
        }
    }

    const { success } = await loadDirHelper(dir, closeHelper, {
        root,
        cachedOnly: true,
        fatal: false,
        errorMessage: "Failed to close app."
    });

    return success;
}

/**
 * Refresh everything
 * @param {String} dir 
 * @param {String} [root] - Defaults to the working directory.
 */
const refresh = async function (dir, root) {

    const refreshHelper = async (plugin, file) => {
        if ('refresh' in plugin) {
            await plugin.refresh();

            if (verbose) {
                log.info(`Refreshed file: ${path.join(dir, file)}`);
            }
        }
    }

    const { success } = await loadDirHelper(dir, refreshHelper, {
        root,
        errorMessage: "Failed to refresh app."
    });

    return success;
}

module.exports = {
    load,
    loadConsole,
    loadHelp,
    close,
    refresh,
    queryFiles
}