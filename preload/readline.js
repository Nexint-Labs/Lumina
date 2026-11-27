const { readline } = require("#boot");

module.exports = {
    async health() {
        return !readline.closed;
    },

    async close() {
        if (readline.closed) return;
        readline.close();
    }
}