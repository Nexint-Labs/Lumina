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
const { autoUpdate, errorPolicy, devMode, devMsg, verbose } = getConfig("core/core");
const { tips } = getConfig("cosmetic/tips");
const { consolePrompt } = getConfig("cosmetic/config");
const { frameVer, frameName } = require('#config/core/framework');
const { load, loadConsole } = require('#functions/core/load');
const delay = require("#functions/core/delay");

// Other cool stuff :)
const { date } = require('#functions/core/date');
const { updateCheck } = require('#functions/core/update');
const { gracefulShutdown } = require('#functions/core/powerCycle');

// Prepare the console
const readline = require("node:readline/promises");
const { center, primary, accent, lumeAccent, lumePrimary, dashCenter } = require("#functions/core/gradient");
const { log: fatalLog } = require("#functions/core/fatalShutdown.mjs")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: primary(consolePrompt)
});
const prompt = async () => {
    setReadline(rl);

    try {
        return await rl.question(rl.getPrompt());
    } finally {
        setReadline(null);
    }
};

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

/**
 * Handle Uncaught Errors lol
 * @param {String} type 
 * @returns 
 */
const handleUncaughtError = async function (type, error, origin, policy) {
    try {
        if (policy === "warn") {
            log.error(`An uncaught ${type} has happened`, error)
            log.error(origin)
            return;
        }
        if (policy !== "continue") {
            log.error(origin)
            await log.fatal(`An uncaught ${type} has happened.`, error, 0x0000, true);
            process.exit(1); // KNOWN: If there are multiple uncaught errors, your program is probably cooked anyways. Good luck!
        }
    } catch (handlerError) {
        try {
            fatalLog.error(`Multiple runtime errors have occurred.`);
            fatalLog.error(`1) An uncaught ${type} has happened.`, error);
            fatalLog.error("2) Emergency error handler failed:", handlerError);
            process.exit(2);
        } catch (e) {
            console.error("Multiple cascading logging errors have happened:");
            console.error("1) Original error:", error);
            console.error("2) Handler error:", handlerError);
            console.error("3) Emergency logger error:", e);
            console.error("TIP: You are fried.");
            process.exit(3); // i swear if this somehow runs ur fried
        }
    }
}

// Process.on random unhandled stuff
process.on('uncaughtException', async (error, origin) => {
    await handleUncaughtError("exception", error, origin, errorPolicy.uncaughtException)
});
process.on("unhandledRejection", async (reason, promise) => {
    await handleUncaughtError("rejection", reason, promise, errorPolicy.unhandledRejection)
})
process.on("warning", (warning) => {
    log.warn(`${warning.name}: ${warning.message}`);
});
process.on("worker", (worker) => {
    if (verbose) {
        log.info(`Worker thread ${worker.threadId} created.`);
    }
});

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

    // Windows specific patch what please microsoft adopt linux standards what are you doing
    if (process.platform === "win32") {
        rl.on("SIGINT", function () {
            process.emit("SIGINT");
        });
        process.on("SIGBREAK", async () => {
            await gracefulShutdown("Ctrl-Break", true);
        });
    }

    // Sigint / Sigterm / Sighup (real)
    process.on("SIGINT", async () => {
        await gracefulShutdown("Ctrl-C", true);
    });
    process.on('SIGTERM', async () => {
        await gracefulShutdown("OS Termination", true)
    })
    process.on("SIGHUP", async () => {

        // WHY MORE WINDOWS SPECIFIC BEHAVIOR AAAAAA
        if (process.platform === "win32") {
            await gracefulShutdown("Console Closed", true);
        } else {
            log.event("SIGHUP received.");
        }
    });

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

    log.info(primary(dashCenter("Welcome!")))
    log.info(center(`Welcome to ${lumeAccent(frameName)}`));
    log.info(center(`You're running version: ${lumeAccent(frameVer)}`));
    log.info(center("Stay up to date for the best features."));
    log.info(center(`Run ${lumeAccent("/help")} to get started!`));
    if (devMode) {
        log.info(center(devMsg));
    } else if (tips.length) {
        log.info(center(`Tip: ${tips[Math.floor(Math.random() * tips.length)]}`));
    }
    log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
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
    try {
        while (consoleOpen) {
            const command = await prompt();

            if (command.trim()) {
                if (!standalone && await loadConsole("console", command, root)) {
                    continue;
                }

                if (await loadConsole("console", command, frameworkDir)) {
                    continue;
                }
            }

            // why am i doing this
            log.info("This command is not valid.")
            log.info("Tip: Run /help to see all commands!")

            continue;
        }

    } catch (error) {
        consoleOpen = false;
        await log.fatal(`The console input is unstable. Shutting down early.`, error, 0x0001, true)
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