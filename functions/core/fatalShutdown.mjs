import { styleText } from "node:util";
import dateCore from "./date.js";
import dateOptionsCore from "#config/core/core";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import dirs from "#functions/core/dirs";

const { root, frameworkDir, standalone } = dirs;

const require = createRequire(import.meta.url);
const { dateOptions, verbose, frameName } = dateOptionsCore;
const { date } = dateCore;
const DateFormatter = new Intl.DateTimeFormat(undefined, dateOptions)
const SHUTDOWN_TIMEOUT = 5000;


const log = {

    /**
     * Info event
     * @param {String} text 
     */
    info: function (text) {
        console.log(`[INFO] [${DateFormatter.format(Date.now())}] ${text}`);
    },

    /**
     * Error event
     * @param {String} text 
     * @param {Error} error 
     */
    error: function (text, error) {

        const messages = [
            `[ERROR] [${DateFormatter.format(Date.now())}] ${text}`,
        ]

        for (const message of messages) {
            console.error(styleText("redBright", message))
        }

        if (error) {
            console.error(error)
        }
    },

    /**
     * Log a given event lol
     * @param {String} text 
     */
    event: function (text) {

        const messages = [
            `[EVENT] [${DateFormatter.format(Date.now())}] ${text}`,
        ]

        for (const message of messages) {
            console.log(styleText("blueBright", message))
        }
    },
}



/**
 * Close everything (shut it all down) safely.
 * @param {String} dir 
 * @param {String} root 
 */
const close = async function (dir, root = process.cwd()) {

    let success = true;

    const files = fs.readdirSync(path.join(root, dir), { recursive: true });
    for (const file of files) {

        // Only load JS files (trust)
        if ([".js", ".cjs", ".mjs"].includes(path.extname(file).toLowerCase())) {

            // Load the help menu?
            try {
                const filename = require.resolve(path.join(root, dir, file));
                const cached = require.cache[filename];

                if (!cached || !cached.loaded) {
                    continue;
                }

                const app = cached.exports;

                if (typeof app.close === "function") {
                    await app.close();

                    if (verbose) {
                        log.info(`Closed file: ${path.join(dir, file)}`);
                    }
                }
            } catch (error) {
                log.error("Failed to close app.")
                log.error(`Problematic file: ${path.join(dir, file)}`, error)
                success = false
            }
        }
    }
    return success;
}

let shutDownState = null;

/**
 * Force Shutdown of bot
 * @param {String} cause 
 */
const forceShutdown = async function (cause) {
    if (shutDownState) {
        return;
    }
    shutDownState = true;

    // Hard deadline, independent of the cleanup promises.
    const watchdog = setTimeout(() => {
        try {
            log.error("Forced shutdown exceeded its timeout.");
        } catch {
            process.exit(2)
        }
        process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    log.info(`\x1b[36m--------------------- Nex ${date.getFullYear()} ---------------------\x1b[0m`)
    log.event(`Forced Shutdown triggered by: ${cause}`)
    log.event("Closing all apps...")
    try {
        let success = true;
        let dirs = ["apps", "plugins", "preload"];
        for (const dir of dirs) {
            if (!await close(dir, root)) {
                success = false
            }
        }
        if (!standalone) {
            let dirs = ["plugins", "preload"];
            for (const dir of dirs) {
                if (!await close(dir, frameworkDir)) {
                    success = false;
                }
            }
        }
        if (!success) {
            log.error("One or more components failed to close.");
        } else {
            log.event("All components closed successfully.");
        }
    } catch (error) {
        log.error(`${frameName} could not be force shut down properly.`, error)
        process.exit(1);
    }
    log.event("Shutting down.")
    log.info(`\x1b[36m----------------------------------------------------\x1b[0m`)
    process.exit(1);
}

export { forceShutdown, log };