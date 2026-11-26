const { date } = require('#functions/core/date');
const { log, print, printErr } = require('#functions/core/log.mjs');
const { primary, accent } = require('#functions/core/gradient');
const { promisify } = require("node:util");

const { getConfig } = require("#functions/core/getConfig");
const { devMode } = getConfig("core/core");
const exec = promisify(require("node:child_process").exec);

module.exports = {
    // Example of a help menu given by the bot.
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Privileged:',
            `/exec: Execute commands (DANGEROUS)`,
            `It's recommended to override this.`,
            `Only enabled in dev mode.`,
        ];
    },
    // Example of a command in the CLI (command line) of the bot.
    // Input: command given by the bot, readline function, client
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/exec": {
                log.info(primary(`----------------------- Exec -----------------------`))

                if (devMode !== true) {
                    log.warn("This command is not available without dev mode.")
                    log.warn("Nothing has been done.")
                    log.info(accent(`--------------------- Nex ${date.getFullYear()} ---------------------`))
                    return true;
                }
                const input = command.slice(6).trim();

                if (!input) {
                    log.warn("No input specified.")
                    log.warn("Nothing has been done.")
                    log.info(accent(`--------------------- Nex ${date.getFullYear()} ---------------------`))
                    return true;
                }

                try {
                    const { stdout, stderr } = await exec(input, {
                        timeout: 30_000
                    });

                    if (stdout) print(stdout);
                    if (stderr) printErr(stderr);
                } catch (error) {
                    log.error("Command execution failed.", error);
                }
                log.info(accent(`--------------------- Nex ${date.getFullYear()} ---------------------`))

                return true;
            }
            default:
                return false;
        }
    }
}