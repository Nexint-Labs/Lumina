import config from "#functions/core/getConfig";
const { getConfig } = config;
const { dateOptions } = getConfig("core/core");
import { styleText, inspect } from "node:util";
import { forceShutdown } from "./fatalShutdown.mjs";
import { writeLogFile } from "#preload/core/fileLog";
import { clearLine, cursorTo, moveCursor, clearScreenDown } from "node:readline";

/**
 * @type {import("node:readline").Interface | null}
 */
let rl = null;

/**
 * @type {Function | null}
 */
let closeHandler = null;

/**
 * Register or detach the readline interface.
 * mr chatgpt over here made this method and that has some wack conventions ok
 * @param {import("node:readline").Interface | null} instance
 */
const setReadline = function (instance) {

    // normalization
    if (instance?.closed) {
        instance = null;
    }

    // Avoid registering the same interface twice.
    if (rl === instance) {
        return;
    }

    // Remove the cleanup listener from the previous interface.
    if (rl && closeHandler) {
        rl.removeListener("close", closeHandler);
    }

    rl = instance;
    closeHandler = null;

    if (!instance) {
        return
    };

    closeHandler = function () {
        if (rl !== instance) {
            return
        };

        try {
            if (process.stdout.isTTY) {
                const { rows } = instance.getCursorPos();

                moveCursor(process.stdout, 0, -rows);
                cursorTo(process.stdout, 0);
                clearScreenDown(process.stdout);
            }
        } finally {
            rl = null;
            closeHandler = null;
        }
    };

    instance.once("close", closeHandler);
};

/**
 * Print Helper lol
 * @param {Function} output 
 * @param  {...any} args 
 */
const printHelper = function (output, ...args) {
    const interactive = rl && !rl.closed && process.stdout.isTTY;

    if (interactive) {
        const { rows } = rl.getCursorPos();

        moveCursor(process.stdout, 0, -rows);
        cursorTo(process.stdout, 0);
        clearScreenDown(process.stdout);
    }

    output(...args);

    if (interactive) {
        rl.prompt(true);
    }
};

// Helper functions
const print = (...args) => printHelper(console.log, ...args);
const printErr = (...args) => printHelper(console.error, ...args);

const DateFormatter = new Intl.DateTimeFormat(undefined, dateOptions)
let infoCount = 0;
let successCount = 0;
let warnCount = 0;
let errorCount = 0;
let eventCount = 0;
let fatalCount = 0;
let fatal = false;
const log = {

    /**
     * Info event
     * @param {String} text 
     */
    info: function (text) {
        print(`[INFO] [${DateFormatter.format(Date.now())}] ${text}`);
        infoCount += 1;
    },

    /**
     * Successful event!
     * @param {String} text 
     */
    success: function (text) {

        const message = `[SUCCESS] [${DateFormatter.format(Date.now())}] ${text}`;

        print(styleText("greenBright", message));
        writeLogFile(message);
        successCount += 1;
    },

    /**
     * Log a given event lol
     * @param {String} text 
     */
    event: function (text) {

        const message = `[EVENT] [${DateFormatter.format(Date.now())}] ${text}`

        print(styleText("blueBright", message))
        writeLogFile(message)
        eventCount += 1;
    },

    /**
     * Warning event
     * @param {String} text 
     */
    warn: function (text) {

        const message = `[WARN] [${DateFormatter.format(Date.now())}] ${text}`

        print(styleText("yellowBright", message))
        writeLogFile(message)
        warnCount += 1;
    },

    /**
     * Error event
     * @param {String} text 
     * @param {Error} error 
     */
    error: function (text, error) {

        const message = `[ERROR] [${DateFormatter.format(Date.now())}] ${text}`;

        printErr(styleText("redBright", message))
        writeLogFile(message)

        if (error) {
            printErr(error)

            const formatted = inspect(error, {
                depth: null,
                colors: false,
                showHidden: true
            });
            writeLogFile(formatted)
        }
        errorCount += 1;
    },

    /**
     * Fatal event
     * @param {String} text 
     * @param {Error} error 
     * @param {Number} code 
     * @param {Boolean} shutdown 
     */
    fatal: async function (text, error, code = 0x0000, shutdown = false) {

        const timestamp = DateFormatter.format(Date.now());

        fatalCount += 1;
        const hexCode = `0x${code.toString(16).toUpperCase().padStart(4, "0")}`;

        const messages = [
            `[FATAL] [${timestamp}] ${text}`,
            `[FATAL] [${timestamp}] Code: ${hexCode}`,
            `[FATAL] [${timestamp}] Info Events: ${infoCount}`,
            `[FATAL] [${timestamp}] Success Events: ${successCount}`,
            `[FATAL] [${timestamp}] Warn Events: ${warnCount}`,
            `[FATAL] [${timestamp}] Error Events: ${errorCount}`,
            `[FATAL] [${timestamp}] Fatal Events: ${fatalCount}`,
            `[FATAL] [${timestamp}] General Events: ${eventCount}`,
        ]

        for (const message of messages) {
            printErr(styleText("red", message))
            writeLogFile(message)
        }

        if (error) {
            printErr(error)

            const formatted = inspect(error, {
                depth: null,
                colors: false,
                showHidden: true
            });
            writeLogFile(formatted)
        }



        if (shutdown && !fatal) {
            fatal = true
            await forceShutdown(text);
            process.exit(1) // This should never run
        }
    },
}

const getInfo = function () {
    return infoCount
}
const getSuccess = function () {
    return successCount
}
const getWarn = function () {
    return warnCount
}
const getError = function () {
    return errorCount
}
const getEvent = function () {
    return eventCount
}
const getFatal = function () {
    return fatalCount
}

export { log, getInfo, getSuccess, getWarn, getError, getEvent, getFatal, setReadline, print, printErr };