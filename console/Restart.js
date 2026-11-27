const { frameName } = require('#config/core/framework');
const { getConfig } = require("#functions/core/getConfig");
const { restart } = getConfig("core/core");
const delay = require("#functions/core/delay");
const { gracefulShutdown, refreshCycle, reload, healthCheck } = require('#functions/core/powerCycle');
const { spawn } = require('child_process');
const { lumeAccent } = require('#functions/core/gradient');

module.exports = {
    // Example of a help menu given by Lumina
    // Input: none
    // Expected Return: An array of strings.
    help() {
        return [
            'Power Ops:',
            '/reload - Reloads the entire app (nearly from scratch)',
            '/refresh - Refreshes commands, etc.',
            `/restart - Restarts ${lumeAccent(frameName)}. Recommended when updating.`,
            '/health - Health checker',
            '/rs - Mirror of /restart',
            `/stop - Closes ${lumeAccent(frameName)}.`,
            '/end - Mirror of /stop.',
        ];
    },
    // Example of a command in the CLI (command line) of Lumina
    // Input: command given by Lumina
    // Expected Return: true or false depending on if the command was valid or not. Otherwise, this breaks the code used to determine if a command is valid or not.
    async command(command) {
        switch (command.split(" ")[0].toLowerCase()) {
            case "/end":
            case "/stop":
            case "/shutdown":
                await gracefulShutdown("Console // Shutdown", true)
                return false; // This should not run, but like
            case "/rs":
            case "/restart":
                const success = await gracefulShutdown("Console // Restart", false)
                const child = spawn(restart, {
                    detached: true,
                    shell: true,
                    stdio: 'ignore'
                })
                child.once("error", (error) => {
                    console.error("Failed to launch restart command:", error);
                    process.exit(1);
                });
                child.unref()
                await delay(1000)
                if (!success) {
                    process.exit(1);
                }
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