const processLogs = require('./lib/index');
require('dotenv').config();
async function main() {
    try {
        var processed = await processLogs();
    } catch (e) {
        console.error(e);
    }
}
main();