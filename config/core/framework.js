/**
 * Framework level code lol
 */
const { version } = require("../../package.json");

module.exports = {
    frameName: "Lumina", // Framework Name
    frameVer: `${version}`, // Version of the bot
    frameID: 26, // Framework version ID
    updateURL: "https://github.com/Nexint-Labs/Lumina/",
    updateSource: "https://raw.githubusercontent.com/Nexint-Labs/Lumina/refs/heads/main", // prolly dont change this unless you know what ur doing
    lumeTheme: {
        primary: "#00FFFF",
        secondary: "#FF00FF",
        accent: "#FF66CC",
        accentSecondary: "#66CCFF"
    }
}