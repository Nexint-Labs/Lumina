module.exports = {
    devMode: false, // Determines dev mode?
    devMsg: "Dev mode is enabled.",
    devName: "Nexint",
    dateOptions: {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    },
    verbose: false, // Extra Logging Info
    autoUpdate: true,

    restart: process.platform === "win32"
        ? "start start.bat"
        : "sh start.sh", // Restart command. This would be different on a linux based system. It would be "sh start.sh".

    /*
    It's in your best interest to not change this unless you know what you're doing.
    Please don't change this :sob:
    Types: warn, shutdown, continue
    */
    errorPolicy: {
        uncaughtException: "shutdown",
        unhandledRejection: "warn",
        healthPolicy: "warn"
    },

    allowEval: false // PLEASE DO NOT ALLOW EVAL HELP
}