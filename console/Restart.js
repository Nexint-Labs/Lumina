// Sample code to import a client and other constants.
/*
const { restart } = require('../../config.js');
const { helpMenu, readline, spawn, exitHandler, server } = require('../../index.js');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
*/
const { frameName } = require('#config/core/framework');
const { getConfig } = require("#functions/core/getConfig");
const { restart } = getConfig("core/core");
const { pluginName } = getConfig("cosmetic/config");
const { date } = require("#functions/core/date");
const delay = require("#functions/core/delay");
const { frameworkDir, standalone, root } = require("#functions/core/dirs");
const { loadHelp } = require("#functions/core/load");
const { log } = require('#functions/core/log.mjs');
const { gracefulShutdown, refreshCycle, reload, healthCheck } = require('#functions/core/powerCycle');
const { spawn } = require('child_process');
const { primary, accent, lumeAccent } = require('#functions/core/gradient');

module.exports = {
    // Example of a help menu given by the bot.
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Built-in:',
            '/help (page) - Opens this help menu.',
            '/h (page) - Mirror of /help.',
            'The help menu can be expanded upon by other plugins.',
            '/info (page) - Opens a neat info menu!',
            'Note: Info can\'t be expanded upon by other plugins.',
            '/reload - Reloads the entire app (nearly from scratch)',
            '/refresh - Refreshes commands, etc.',
            `/restart - Restarts ${lumeAccent(frameName)}. Recommended when updating.`,
            '/health - Health checker',
            '/rs - Mirror of /restart',
            `/stop - Closes ${lumeAccent(frameName)}.`,
            '/end - Mirror of /stop.',
        ];
    },
    // Example of a command in the CLI (command line) of the bot.
    // Input: command given by the bot
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/h":
            case "/help":

                let helpMenu = await loadHelp("console", frameworkDir);

                if (!standalone) {
                    helpMenu = helpMenu.concat(await loadHelp("console", root));
                }

                // Help Menu
                let page;
                if (command.split(" ")[1] != undefined) {
                    page = Number(parseInt(command.split(" ")[1].toLowerCase(), 10));
                    if (isNaN(page) || page < 1) {
                        page = 1;
                    }
                } else {
                    page = 1;
                }

                // forced symmetry get nuked
                if (page < 10) {
                    log.info(primary(`----------------- Help menu: (${page}/${Math.ceil((helpMenu.length) / 8)}) -----------------`))
                } else {
                    log.info(primary(`----------------- Help menu: (N/A) -----------------`))
                }

                let countHelp = 0;
                for (let i = (page - 1) * 8; i < Math.min(8 + ((page - 1) * 8), helpMenu.length); i++) {
                    log.info(helpMenu[i])
                    countHelp++;
                }
                if (countHelp == 0) {
                    log.info("How did you get here?")
                }
                log.info(accent(`--------------------- Nex ${date.getFullYear()} ---------------------`))
                return true;
            case "/info":
                let info;
                const infoList = [
                    'Version control:',
                    'The first number (X.0.0) is the major release.',
                    'The second number (0.X.0) is the minor release.',
                    'The third number (0.0.X) is the patch #.',
                    `Breaking changes may occur between ${lumeAccent(frameName)} 0.x releases.`,
                    'Compatibility is not guaranteed until v1.0.0.',
                    'Built-in plugins aside from "built-in" are typically',
                    'not updated as often, and may be unstable.',
                    'What means what?',
                    `${lumeAccent(frameName)} version is the version of the NodeJS framework.`,
                    `${pluginName} version is the version of the plugins / deployment.`,
                    'Dev is the dev instance, prod is the prod instance.',
                    'Disclaimers:',
                    'Third party plugins are not guaranteed to be supported.',
                    `${lumeAccent(frameName)} is in active development and may introduce breaking changes.`,
                    'Have fun running this! - Nexint',
                ];
                if (command.split(" ")[1] != undefined) {
                    info = Number(parseInt(command.split(" ")[1].toLowerCase(), 10));
                    if (isNaN(info) || info < 1) {
                        info = 1;
                    }
                } else {
                    info = 1;
                }

                // forced symmetry get nuked
                if (info < 10) {
                    log.info(primary(`----------------- Info menu: (${info}/${Math.ceil((infoList.length) / 8)}) -----------------`))
                } else {
                    log.info(primary(`----------------- Info menu: (N/A) -----------------`))
                }

                let countInfo = 0;
                for (let i = (info - 1) * 8; i < Math.min(8 + ((info - 1) * 8), infoList.length); i++) {
                    log.info(infoList[i])
                    countInfo++;
                }
                if (countInfo == 0) {
                    log.info("How did you get here?")
                }
                log.info(accent(`--------------------- Nex ${date.getFullYear()} ---------------------`))
                return true;
            case "/end":
            case "/stop":
            case "/shutdown":
                await gracefulShutdown("Console // Shutdown", true)
                return false; // This should not run, but like
            case "/rs":
            case "/restart":
                await gracefulShutdown("Console // Restart", false)
                const child = spawn(restart, {
                    detached: true,
                    shell: true,
                    stdio: 'ignore'
                })
                child.unref()
                await delay(1000)
                process.exit(0);
            case "/refresh":
                await refreshCycle("Console // Refresh")
                return true;
            case "/reload":
                await reload("Console // Reload")
                return true;
            case "/health":
                await healthCheck("Console // Health", false)
                return true;
            default:
                return false;
        }
    }
}