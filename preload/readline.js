const { readline } = require("#boot");

module.exports = {
    async health() {
        return !readline.closed;
    },

    async close() {
        if (readline.closed) return;

        readline.setPrompt("");
        readline.write(null, { ctrl: true, name: "e" });
        readline.write(null, { ctrl: true, name: "u" });
        readline.prompt(true);
        readline.close();
    }
}