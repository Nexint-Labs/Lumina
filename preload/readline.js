const { readline } = require("#boot");

module.exports = {
    async health() {
        return !readline.closed;
    },

    async close() {
        await readline.close();
    }
}