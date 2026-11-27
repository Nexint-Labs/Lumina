const { date } = require('#functions/core/date');
const { center, bar, primary, accent, dashCenter } = require('#functions/core/gradient');
const { log } = require('#functions/core/log.mjs');
const { cpuPerf, memPerf, eventPerf } = require('#preload/core/perf');

module.exports = {
    // Example of a help menu given by the bot.
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Performance:',
            '/perf: Summary!',
            '/perf cpu: CPU usage',
            '/perf mem: Memory',
            '/perf loop: Loops',
            'This checks the current process only*',
        ];
    },
    // Example of a command in the CLI (command line) of the bot.
    // Input: command given by the bot, readline function, client
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/perf":
            case "/perform":
            case "/performance":
                let print;
                if (command.split(" ")[1] != undefined) {
                    print = command.split(" ")[1].toLowerCase();
                }
                switch (print) {
                    case "cpu":
                        log.info(primary(dashCenter(`Perf Metrics`)))
                        await cpuPerf(false)
                        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                        break;
                    case "mem":
                    case "ram":
                    case 'memory':
                        log.info(primary(dashCenter(`Perf Metrics`)))
                        await memPerf(false)
                        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                        break;
                    case "event":
                    case 'loop':
                        log.info(primary(dashCenter(`Perf Metrics`)))
                        await eventPerf(false)
                        log.info(accent(dashCenter(`Nex ${date.getFullYear()}`)))
                        break;
                    case undefined:
                    case "":
                    case 'sum':
                    case 'summary':
                        log.info(primary(dashCenter(`Perf Metrics`)))
                        const cpu = await cpuPerf();
                        const mem = await memPerf();
                        const event = await eventPerf();

                        const heap = mem.heapUsed / mem.heapTotal * 100;

                        log.info(center(`CPU Usage: ${cpu.toFixed(2)}%`));
                        log.info(center(bar(cpu)));

                        log.info(center(`Heap Usage: ${heap.toFixed(2)}%`));
                        log.info(center(bar(heap)));

                        log.info(center(`Event Loop: ${(event.utilization * 100).toFixed(2)}%`));
                        log.info(center(bar(event.utilization * 100)));
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