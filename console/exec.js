const { date } = require('#functions/core/date');
const { log, print, printErr } = require('#functions/core/log.mjs');
const { primary, accent, dashCenter } = require('#functions/core/gradient');
const { promisify } = require("node:util");

const { getConfig } = require("#functions/core/getConfig");
const { devMode } = getConfig("core/core");
const exec = promisify(require("node:child_process").exec);

module.exports = {
    disable: !devMode,
    // Example of a help menu given by the bot.
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Privileged:',
            `/exec: Execute commands (DANGEROUS)`,
            `/eval: Arbitrary JS Execution (DANGEROUS)`,
            `This command is only enabled in dev mode.`,
        ];
    },
    // Example of a command in the CLI (command line) of the bot.
    // Input: command given by the bot, readline function, client
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/exec": {
                log.info(primary(dashCenter(`Exec`)))
                const input = command.slice(6).trim();

                if (!input) {
                    log.warn("No input specified.")
                    log.warn("Nothing has been done.")
                    log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
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
                log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))

                return true;
            }
            case "/eval": {
                log.info(primary(dashCenter(`Eval`)))
                const input = command.slice(6).trim();

                if (!input) {
                    log.warn("No input specified.")
                    log.warn("Nothing has been done.")
                    log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                    return true;
                }

                try {
                    const result = await eval(
                        `(async () => {${input}\n})()`
                    );
                    if (result !== undefined) print(result)
                } catch (error) {
                    log.error("Command execution failed.", error);
                }
                log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))

                return true;
            }
            default:
                return false;
        }
    }
}