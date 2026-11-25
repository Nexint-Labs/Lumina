// Configure root directories
const path = require("node:path");

const root = process.cwd();
const frameworkDir = path.resolve(__dirname, "../..");
const standalone = root === frameworkDir;

module.exports = {
    root,
    frameworkDir,
    standalone
};