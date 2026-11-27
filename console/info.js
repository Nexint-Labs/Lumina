const { frameName } = require('#config/core/framework');
const { getConfig } = require("#functions/core/getConfig");
const { appName } = getConfig("cosmetic/config");
const { date } = require("#functions/core/date");
const { frameworkDir, standalone, root } = require("#functions/core/dirs");
const { loadHelp } = require("#functions/core/load");
const { log } = require('#functions/core/log.mjs');
const { primary, accent, lumeAccent, dashCenter } = require('#functions/core/gradient');

module.exports = {
    // Example of a help menu given by Lumina
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Help Docs:',
            '/help (page) - Opens this help menu.',
            '/h (page) - Mirror of /help.',
            'The help menu can be expanded upon by other plugins.',
            '/info (page) - Opens a neat info menu!',
            'Note: Info can\'t be expanded upon by other plugins.',
        ];
    },
    // Example of a command in the CLI (command line) of Lumina
    // Input: command given by Lumina
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/h":
            case "/help":

                let helpMenu = []
                if (!standalone) {
                    helpMenu = helpMenu.concat(await loadHelp("console", root));
                }

                helpMenu = helpMenu.concat(await loadHelp("console", frameworkDir));

                // Help Menu
                let page;
                if (command.split(" ")[1] != undefined) {
                    page = Number(parseInt(command.split(" ")[1].toLowerCase(), 10));
                    if (!Number.isSafeInteger(page) || page < 1) {
                        page = 1;
                    }
                } else {
                    page = 1;
                }

                // forced symmetry get nuked
                log.info(primary(dashCenter(`Help menu: (${page}/${Math.ceil((helpMenu.length) / 8)})`)))

                let countHelp = 0;
                for (let i = (page - 1) * 8; i < Math.min(8 + ((page - 1) * 8), helpMenu.length); i++) {
                    log.info(helpMenu[i])
                    countHelp++;
                }
                if (countHelp == 0) {
                    log.info("How did you get here?")
                }
                log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
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
                    `${appName} version is the version of the app.`,
                    'Dev is the dev instance, prod is the prod instance.',
                    'Disclaimers:',
                    'Third party plugins are not guaranteed to be supported.',
                    `${lumeAccent(frameName)} is in active development and may introduce breaking changes.`,
                    'Have fun running this! - Nexint',
                ];
                if (command.split(" ")[1] != undefined) {
                    info = Number(parseInt(command.split(" ")[1].toLowerCase(), 10));
                    if (!Number.isSafeInteger(info) || info < 1) {
                        info = 1;
                    }
                } else {
                    info = 1;
                }

                // forced symmetry get nuked
                log.info(primary(dashCenter(`Info menu: (${info}/${Math.ceil((infoList.length) / 8)})`)))

                let countInfo = 0;
                for (let i = (info - 1) * 8; i < Math.min(8 + ((info - 1) * 8), infoList.length); i++) {
                    log.info(infoList[i])
                    countInfo++;
                }
                if (countInfo == 0) {
                    log.info("How did you get here?")
                }
                log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                return true;
            default:
                return false;
        }
    }
}