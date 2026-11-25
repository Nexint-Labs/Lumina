module.exports = {
    devMode: false, // Determines dev mode?
    devMsg: "This bot is running in dev mode. Developer functions are enabled.",
    devName: "Nexint",
    dateOptions: {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    },
    verbose: false, // Extra Logging Info
    autoUpdate: true,

    restart: "start start.bat", // Restart command. This would be different on a linux based system. It would be "sh start.sh".
    // args: ['--', 'bash', '-c', "./start.sh"],

    /*
    It's in your best interest to not change this unless you know what you're doing.
    Please don't change this :sob:
    Types: warn, shutdown, continue
    */
    errorPolicy: {
        uncaughtException: "shutdown",
        unhandledRejection: "warn",
    }
}