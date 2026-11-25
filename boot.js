// Configure root directories
const { root, frameworkDir, standalone } = require("#functions/core/dirs")

// Import the .env lol
const { loadEnvFile } = require("node:process");
const { parseEnv } = require("node:util");
const fs = require('node:fs');
const path = require('path');

let envCount;

try {
    loadEnvFile(path.join(root, ".env"));
    envCount = Object.keys(
        parseEnv(fs.readFileSync(path.join(root, ".env"), "utf8"))
    ).length;
} catch (error) {
    if (error.code !== "ENOENT") throw error;
}

// Load configs (that actually matter)
const { getConfig } = require("#functions/core/getConfig");
const { logFormat } = getConfig("core/log");

if (!process.env.PRISM_LOG_FORMAT) {
    process.env.PRISM_LOG_FORMAT = logFormat
}
const { log, setReadline, print } = require('#functions/core/log.mjs');

log.event(`Loading configs...`)
const { autoUpdate, errorPolicy } = getConfig("core/core");
const { frameVer, frameName } = require('#config/core/framework');
const { load, loadConsole } = require('#functions/core/load');
const delay = require("#functions/core/delay");

// Other cool stuff :)
const { date } = require('#functions/core/date');
const { updateCheck } = require('#functions/core/update');
const { gracefulShutdown } = require('#functions/core/powerCycle');

// Prepare the console
const readline = require('node:readline');
const { gradient } = require("#functions/core/gradient");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
setReadline(rl);
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

// Start loading
const startLoad = Date.now();
const start = performance.now();

// Is the console open?
let consoleOpen = true;

// Export some weird stuff idk
module.exports = {
    consoleOpen,
    startLoad,
    readline: rl,
}

// Process.on random unhandled stuff
process.on('uncaughtException', async (error, origin) => {
    try {
        if (errorPolicy.uncaughtException === "warn") {
            log.error("An uncaught exception has happened", error)
            log.error(origin)
            return;
        }
        if (errorPolicy.uncaughtException !== "continue") {
            log.error(origin)
            await log.fatal("An uncaught exception has happened.", error, 0x0000, true);
            process.exit(1); // this shouldnt run but i have it
        }
    } catch {
        process.exit(2); // this shouldnt run but i have it
    }
});
process.on("unhandledRejection", async (error, origin) => {
    try {
        if (errorPolicy.unhandledRejection === "warn") {
            log.error("An uncaught promised rejection has happened", error)
            log.error(origin)
            return;
        }
        if (errorPolicy.unhandledRejection !== "continue") {
            log.error(origin)
            await log.fatal("An uncaught promised rejection has happened.", error, 0x0000, true);
            process.exit(1); // this shouldnt run but i have it
        }
    } catch {
        process.exit(2); // this shouldnt run but i have it
    }
})

const init = async function () {

    log.event("Loading directories...")
    if (envCount === undefined) {
        log.warn("No .env file exists. You should probably make one! (Non-Fatal)");
    } else {
        log.event(`${envCount} envs loaded!`)
    };

    // Make sure directories exist lol
    const dirs = ["plugins", "preload", "console", "databases", "apps", "functions", "test", "config"];
    dirs.forEach((dir) => {
        const dirPath = path.join(root, dir);

        if (!fs.existsSync(dirPath)) {
            log.event(`Creating directory: ${dir}`);
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    // Windows specific patch im ticked off bro
    // Screw you microsoft :sob:
    if (process.platform === "win32") {
        rl.on("SIGINT", function () {
            process.emit("SIGINT");
        });
    }

    // Sigint / Sigterm (real)
    process.on('SIGINT', async () => {
        await gracefulShutdown("Ctrl-C", true)
    })
    process.on('SIGTERM', async () => {
        await gracefulShutdown("OS Termination", true)
    })

    main().catch(async error => {
        await log.fatal(`${frameName} failed to initialize external files.`, error, 0x0001, true);
        process.exit(1)
    });
}

/**
 * Main function
 * This is the main function that runs the entire backend.
 * what am i doing bro :sob:
 */
const main = async () => {

    log.event("Loading files...")

    // Load framework preloads + plugins
    await load("preload", frameworkDir);
    await load("plugins", frameworkDir);

    // Load application preloads + plugins
    if (!standalone) {
        await load("preload", root);
        await load("plugins", root);
    }

    // Load the apps (FINALLY?)
    // This makes my API super modular :)
    await load("apps", root);

    log.info(`\x1b[36m--------------------- Nex ${date.getFullYear()} ---------------------\x1b[0m`)
    log.info(`                 ${gradient(`Welcome to ${frameName}!`, "#FF66CC", "#66CCFF")}                 `);
    log.info(`             You're running version: ${frameVer}             `);
    log.info("        Stay up to date for the best features.        ");
    log.info('\x1b[36m----------------------------------------------------\x1b[0m');
    const elapsed = performance.now() - start;

    if (elapsed < 1000) {
        log.success(`Done in ${elapsed.toFixed(3)}ms!`);
    } else {
        log.success(`Done in ${(elapsed / 1000).toFixed(3)} seconds!`);
    }
    print("Server is running.")

    await updateCheck(true)

    // real?
    await asyncFunctions();
}

init().catch(async error => {
    await log.fatal(`${frameName} failed to start initializing.`, error, 0x0000, true);
    process.exit(1)
});

/**
 * Async Functions
 * These functions are deliberately async'd
 */
const asyncFunctions = async function () {
    commandParser();
    if (autoUpdate) {
        autoUpdateCheck();
    } else {
        log.info("Automatic update checking disabled.")
    }
}

/**
 * Command Parser
 * Parses commands
 */
const commandParser = async () => {
    while (consoleOpen) {
        const command = await prompt('> ');

        // why am i doing this
        if (!(await loadConsole("console", command, frameworkDir))) {
            if (standalone || !(await loadConsole("console", command, root))) {
                log.info("This command is not valid.")
            }
        }
    }
}

/**
 * Update Checker
 * Checks updates lol
 */
const autoUpdateCheck = async () => {
    while (consoleOpen) {
        await delay(3600000); // artificial delay to ensure host's CPU doesn't die
        updateCheck(false);
    }
}