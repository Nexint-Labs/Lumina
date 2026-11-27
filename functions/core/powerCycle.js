const { getConfig } = require("#functions/core/getConfig");
const { clearDirectory } = require("./clearCache");
const { date } = require("./date");
const { close, refresh, load, health } = require("./load");
const { log } = require("./log.mjs");
const { root, frameworkDir, standalone } = require("#functions/core/dirs");
const { frameName } = require("#config/core/framework");
const { primary, accent, dashCenter } = require("./gradient");
const { errorPolicy } = getConfig("core/core");
const { appName } = getConfig("cosmetic/config");

let shutDownState = null;
let otherState = null;
let healthState = false;

/**
 * Graceful Shutdown of Lumina
 * Exit: Determines if the process exits immediately or not.
 * @param {String} cause 
 * @param {Boolean} exit 
 */
const gracefulShutdown = async function (cause, exit) {

    if (shutDownState) {
        await log.fatal(`Additional shutdown requested during active shutdown. Escalating to forced shutdown. Cause: ${cause}`, null, 0x0004, true);
        process.exit(1) // again, this shouldnt happen in any circumstance, but just a failsafe :)
    }
    if (otherState) {
        log.error(`This app is in an undefined state. Shutting down to avoid conflicts.`)
        await log.fatal(`Shutdown triggered while another power operation was happening. Cause: ${cause}`, null, 0x0004, true);
        process.exit(1) // again, this shouldnt happen in any circumstance, but just a failsafe :)
    }
    shutDownState = true;

    // make sure it actually shuts down
    const watchdog = setTimeout(async () => {
        try {
            await log.fatal("Shutdown exceeded its timeout. Escalating to forced shut down.", null, 0x0003, true)
        } catch {
            process.exit(2)
        }
    }, 30_000);

    try {

        try {
            const { readline } = require("#boot");

            if (readline && !readline.closed) {
                readline.setPrompt("");
                readline.line = "";
                readline.cursor = 0;
                readline.prompt(true);
            }
        } catch {
            // Cosmetic failure. Continue graceful shutdown.
        }

        log.info(primary(dashCenter(`Shutdown`)))
        const startShutdown = performance.now()
        log.event(`Shutdown triggered by: ${cause}`)
        log.event("Closing all apps...")
        let success = true;
        let dirs = ["apps", "plugins", "preload"];

        // Close Apps
        for (const dir of dirs) {
            if (!await close(dir, root)) {
                success = false
            }
        }

        // Close Framework
        if (!standalone) {
            dirs = ["plugins", "preload"];
            for (const dir of dirs) {
                if (!await close(dir, frameworkDir)) {
                    success = false
                }
            }
        }

        if (!success) {
            log.error("One or more components failed to close.");
        } else {
            log.event("All components closed successfully.");
        }

        const elapsed = performance.now() - startShutdown;

        if (elapsed < 1000) {
            log.success(`Shut down in ${elapsed.toFixed(3)}ms.`);
        } else {
            log.success(`Shut down in ${(elapsed / 1000).toFixed(3)}s.`);
        }
        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
        clearTimeout(watchdog);
        shutDownState = false;
        if (exit) {
            if (success) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        }
        return success;
    } catch (error) {
        await log.fatal("An unexpected error happened while trying to shut down.", error, 0x0005, true)
        process.exit(1);
    }
}

/**
 * Reloads files
 * @param {String} cause 
 * @returns 
 */
const reload = async function (cause) {

    // State machine
    if (otherState || shutDownState) {
        return false;
    }
    otherState = true;
    try {
        log.info(primary(dashCenter(`Reload`)))
        const startReload = performance.now()
        log.event(`Reload triggered by: ${cause}`)

        // Closes apps and plugins
        let success = true;
        let dirs = ["apps", "plugins"];

        // Reload App Dirs
        for (const dir of dirs) {
            if (!await close(dir, root)) {
                success = false
            }
        }

        // Reload Framework
        if (!standalone) {
            dirs = ["plugins"];
            for (const dir of dirs) {
                if (!await close(dir, frameworkDir)) {
                    success = false
                }
            }
        }

        // Determine if successful
        if (!success) {
            await log.fatal(`One or more components failed to close.`, null, 0x0003, true);
            process.exit(1) // again, this shouldnt happen in any circumstance, but just a failsafe :)
        } else {
            log.success("Apps have been taken temporarily offline.");
        }

        let cleared = 0;
        let clearedDirs = ["apps", "plugins", "functions", "test", "config", "console"]

        // Clear non framework dirs
        // Sidenote: This shouldn't technically need an order lol
        for (const dir of clearedDirs) {
            cleared += clearDirectory(dir, root)
        }

        // Clear framework dirs
        if (!standalone) {
            clearedDirs = ["plugins", "functions", "test", "config", "console"]
            for (const dir of clearedDirs) {
                cleared += clearDirectory(dir, frameworkDir)
            }
        }

        log.success(`Cleared ${cleared} files!`)

        // Load Framework
        await load("plugins", frameworkDir);

        // Load Apps
        if (!standalone) {
            await load("plugins", root);
        }

        await load("apps", root);

        const elapsed = performance.now() - startReload;

        if (elapsed < 1000) {
            log.success(`Reload complete in ${elapsed.toFixed(3)}ms!`);
        } else {
            log.success(`Reload complete in ${(elapsed / 1000).toFixed(3)}s!`);
        }
        log.warn("Note: Reloading is unstable and not fully supported.")
        log.warn("If things don't work, restart.")
        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
        otherState = false;
        return true;
    } catch (error) {
        await log.fatal("An unexpected error has happened while reloading.", error, 0x0005, true)
        process.exit(1);
    }
}

/**
 * Refreshes the Discord part lol
 * @returns 
 */
const refreshCycle = async function (cause) {

    // State machine
    if (otherState || shutDownState) {
        return false;
    }
    otherState = true;
    try {
        log.info(primary(dashCenter(`Refresh Apps`)))
        const startRefresh = performance.now()
        log.event(`Refresh triggered by: ${cause}`)

        // Start refreshing

        let cleared = 0;
        const clearedDirs = ["functions", "config", "console"]

        // Clear non framework dirs
        for (const dir of clearedDirs) {
            cleared += clearDirectory(dir, root)
            if (!standalone) {
                cleared += clearDirectory(dir, frameworkDir)
            }
        }

        log.success(`Cleared ${cleared} files!`)
        const success = await refresh("apps", root);

        // Determine success or not
        if (!success) {
            await log.fatal("One or more components failed to refresh.", null, 0x0004, true);
            process.exit(1) // again, this shouldnt happen in any circumstance, but just a failsafe :)
        } else {

            const elapsed = performance.now() - startRefresh;

            if (elapsed < 1000) {
                log.success(`Refresh complete in ${elapsed.toFixed(3)}ms!`);
            } else {
                log.success(`Refresh complete in ${(elapsed / 1000).toFixed(3)}s!`);
            }
        }

        // Cleanup
        log.warn("Note: Refreshing is unstable and not fully supported.")
        log.warn("If things don't work, restart or reload.")
        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
        otherState = false;
        return true;
    } catch (error) {
        await log.fatal("An unexpected error has happened while refreshing.", error, 0x0005, true)
        process.exit(1);
    }
}

/**
 * Health checker
 * @param {String} cause 
 * @param {Boolean} quiet // Quiet... Used for auto health checks.
 * @returns 
 */
const healthCheck = async function (cause, quiet = false) {

    // state machine
    if (otherState || shutDownState || healthState) {
        return false;
    }

    healthState = true;

    try {
        const startHealth = performance.now()

        if (!quiet) {
            log.info(primary(dashCenter(`Health`)))
            log.event(`Health check triggered by: ${cause}`)
        }

        // Start the health checker!
        let internalSuccess = true;
        let externalSuccess = true;
        const healthDirs = ["apps", "preload"]

        // Health of internal framework
        if (!standalone) {
            if (!await health("preload", frameworkDir)) {
                internalSuccess = false;
            }
        }

        // Determine success or not
        if (!internalSuccess) {
            if (errorPolicy.healthPolicy == "warn") {
                log.warn(`One or more ${frameName} components failed the heartbeat.`)
            } else if (errorPolicy.healthPolicy !== "continue") {
                await log.fatal(`One or more ${frameName} components failed the heartbeat.`, null, 0x0004, true);
                process.exit(1);
            }
        }

        // Health of external apps lol
        for (const dir of healthDirs) {
            if (!await health(dir, root)) {
                externalSuccess = false;
            }
        }

        // Determine success or not
        if (!externalSuccess) {
            if (errorPolicy.healthPolicy == "warn") {
                log.warn(`One or more ${appName} components failed the heartbeat.`)
            } else if (errorPolicy.healthPolicy !== "continue") {
                await log.fatal(`One or more ${appName} components failed the heartbeat.`, null, 0x0004, true);
                process.exit(1);
            }
        }

        const success = internalSuccess && externalSuccess;

        // Determine success or not
        if (success && !quiet) {

            const elapsed = performance.now() - startHealth;

            if (elapsed < 1000) {
                log.success(`Health check complete in ${elapsed.toFixed(3)}ms!`);
            } else {
                log.success(`Health check complete in ${(elapsed / 1000).toFixed(3)}s!`);
            }
        }

        // Cleanup

        if (!quiet) {
            log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
        }
        healthState = false
        return success;
    } catch (error) {
        await log.fatal("An unexpected error has happened while checking health.", error, 0x0005, true)
        process.exit(1);
    }

}

module.exports = {
    gracefulShutdown,
    reload,
    refreshCycle,
    healthCheck,
    persist: true
}