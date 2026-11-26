// I did not like the fact there was no gradients lol
// so I just forced AI to make it.

const { styleText } = require("node:util");
const { stripVTControlCharacters } = require("node:util");
const { getConfig } = require("./getConfig");
const { lumeTheme } = require("#config/core/framework");
const { theme } = getConfig("cosmetic/config")

/**
 * Apply a linear colour gradient to text.
 * @param {string} text
 * @param {string} from - Starting hex colour.
 * @param {string} to - Ending hex colour.
 * @returns {string}
 */
const gradient = function (text, from, to) {
    const start = Buffer.from(from.slice(1), "hex");
    const end = Buffer.from(to.slice(1), "hex");

    const chars = [...text];
    let result = "";

    for (let i = 0; i < chars.length; i++) {
        const progress = i / Math.max(chars.length - 1, 1);
        let color = "#";

        // Calculate the RGB values
        for (let j = 0; j < 3; j++) {
            const value = Math.round(start[j] + (end[j] - start[j]) * progress);
            color += value.toString(16).padStart(2, "0");
        }

        result += styleText(color, chars[i]);
    }

    return result;
}

/**
 * Bar lol
 * @param {Number} value 
 * @param {Number} max 
 * @param {Number} width 
 * @returns {String}
 */
const bar = function (value, max = 100, width = 32) {
    const ratio = Math.max(0, Math.min(1, value / max));
    const filled = Math.round(ratio * width);

    return primary("█".repeat(filled)) + styleText("gray", "░".repeat(width - filled));
}

/**
 * Centering
 * @param {String} text 
 * @param {Number} width 
 * @returns {String}
 */
const center = function (text, width = 52) {
    const length = stripVTControlCharacters(text).length;
    const padding = Math.max(0, width - length);

    return " ".repeat(Math.floor(padding / 2)) + text + " ".repeat(Math.ceil(padding / 2));
}

const primary = function(text){
    return gradient(text, theme.primary, theme.secondary)
}

const accent = function(text){
    return gradient(text, theme.accent, theme.accentSecondary)
}

const lumePrimary = function(text){
    return gradient(text, lumeTheme.primary, lumeTheme.secondary)
}

const lumeAccent = function(text){
    return gradient(text, lumeTheme.accent, lumeTheme.accentSecondary)
}

module.exports = { gradient, bar, center, primary, accent, lumePrimary, lumeAccent };