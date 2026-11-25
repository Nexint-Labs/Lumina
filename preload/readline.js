const { readline } = require("#index");

module.exports = {
    async health() {
        return !readline.closed;
    },

    async close() {
        await readline.close();
    }
}