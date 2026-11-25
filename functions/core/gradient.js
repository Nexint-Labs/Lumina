// I did not like the fact there was no gradients lol
// so I just forced AI to make it.

const { styleText } = require("node:util");

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

module.exports = { gradient };