const { frameName, frameVer, frameID } = require('#config/core/framework');
const { getConfig } = require("#functions/core/getConfig");
const { pluginName, pluginVer } = getConfig("cosmetic/config");
const { date } = require('#functions/core/date');
const { log, getInfo, getSuccess, getWarn, getError, getFatal, getEvent } = require('#functions/core/log.mjs');
const { getUpdateVersion } = require('#functions/core/update');
const { primary, accent, lumeAccent, dashCenter, lumePrimary } = require('#functions/core/gradient');
const { pluralValues } = require('#functions/core/pluralValues');

module.exports = {
    // Example of a help menu given by the bot.
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Developer:',
            `/print version - Prints version info`,
            `/print build - Prints ${frameName} build`,
            `/print logs - Prints the log events.`,
        ];
    },
    // Example of a command in the CLI (command line) of the bot.
    // Input: command given by the bot, readline function, client
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/print": // Prints various things. This mostly serves as a developer command.
                let print;
                if (command.split(" ")[1] != undefined) {
                    print = command.split(" ")[1].toLowerCase();
                }
                switch (print) {
                    case "v":
                    case "ver":
                    case 'version':
                        log.info(primary(dashCenter(`Version Info`)))
                        const [, latestVersion] = await getUpdateVersion() || [];
                        log.info("Printing the version...")
                        if (pluginName === "N/A") {
                            log.info(`No apps installed.`)
                        } else {
                            log.info(`${primary(pluginName)} Version: ${primary(pluginVer)}`)
                        }
                        if (latestVersion !== undefined) {
                            log.info(`${lumeAccent(frameName)} Version: ${lumeAccent(frameVer)} (ID: ${frameID} / Latest: ${latestVersion}).`)
                        } else {
                            log.info(`${lumeAccent(frameName)} Version: ${lumeAccent(frameVer)}.`)
                        }
                        if (latestVersion > frameID) {
                            log.info(`${latestVersion - frameID} revision${pluralValues(latestVersion - frameID)} behind.`)
                        } else if (!latestVersion) {
                            log.warn(`Framework may or may not be working.`)
                        } else if (latestVersion < frameID) {
                            log.info(`${frameID - latestVersion} revision${pluralValues(frameID - latestVersion)} ahead.`)
                        } else {
                            log.info(`Running the latest version.`)
                        }
                        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                        break;
                    case "b":
                    case 'build':
                        log.info(primary(dashCenter(`Build Info`)))
                        log.info(`Printing the build!`)
                        if (pluginName === "N/A") {
                            log.info(`No apps installed.`)
                        } else {
                            log.info(`${primary(pluginName)} v${primary(pluginVer)}`)
                        }
                        log.info(`${lumeAccent(frameName)} v${lumeAccent(frameVer)}`)
                        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                        break;
                    case 'l':
                    case 'log':
                    case 'logs':
                        const counts = {
                            info: getInfo(),
                            success: getSuccess(),
                            warn: getWarn(),
                            error: getError(),
                            fatal: getFatal(),
                            event: getEvent()
                        };

                        let total = 0;

                        for (const count of Object.values(counts)) {
                            total += count;
                        }
                        log.info(primary(dashCenter(`Log Info`)))
                        log.info(`${total} total events.`)
                        log.info(`${counts.info} info events.`)
                        log.info(`${counts.success} successful events.`)
                        log.info(`${counts.warn} warning events.`)
                        log.info(`${counts.error} error events.`)
                        log.info(`${counts.fatal} fatal events.`)
                        log.info(`${counts.event} general events.`)
                        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                        break;
                    default:
                        return false;
                }
                return true;
            default:
                return false;
        }
    }
}