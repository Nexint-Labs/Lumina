const { clearDirectory } = require('#functions/core/clearCache');
const { date } = require('#functions/core/date');
const { gradient } = require('#functions/core/gradient');
const { load, queryFiles } = require('#functions/core/load');
const { log } = require('#functions/core/log.mjs');

module.exports = {
    // Example of a help menu given by the bot.
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Testing:',
            '/test: Test the bot features!',
            'By default, /print prints what possible arguments there are.',
        ];
    },
    // Example of a command in the CLI (command line) of the bot.
    // Input: command given by the bot, readline function, client
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/test": // Prints various things. This mostly serves as a developer command.
                let print;
                if (command.split(" ")[1] != undefined) {
                    print = command.split(" ")[1].toLowerCase();
                }
                switch (print) {
                    case "a":
                    case 'all':
                        log.info(gradient(`----------------------- Test -----------------------`, "#00ffff", "#FF00FF"))
                        clearDirectory("test")
                        const testFiles = await load("test")
                        log.success(`Tested ${testFiles} cases.`)

                        log.info(gradient(`--------------------- Nex ${date.getFullYear()} ---------------------`, "#00ffff", "#FF00FF"))
                        break;
                    case "i":
                    case 'info':
                        log.info(gradient(`-------------------- Build Info --------------------`, "#00ffff", "#FF00FF"))
                        log.info(`Printing the test info!`)
                        const count = await queryFiles("test")
                        log.info(`Test files: ${count}`)
                        log.info(gradient(`--------------------- Nex ${date.getFullYear()} ---------------------`, "#00ffff", "#FF00FF"))
                        break;
                    default:
                        log.info(`Not a valid argument.`)
                        log.info(`Valid arguments:`)
                        log.info(`all - Test everything`)
                        log.info(`info - Information about the tester!`)
                        log.info(gradient(`--------------------- Nex ${date.getFullYear()} ---------------------`, "#00ffff", "#FF00FF"))
                }
                return true;
            default:
                return false;
        }
    }
}