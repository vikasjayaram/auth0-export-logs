const ManagementClient = require('auth0').ManagementClient;
const moment = require('moment');
const bunyan = require('bunyan');
const appName = 'auth0_get_logs';
const fs = require('fs');

const log = bunyan.createLogger({
    name: appName
});

async function getLogs(management, start, end, page, count) {
    const PER_PAGE = parseInt(process.env.PER_PAGE);
    const MAX_PAGE_NUMBER = parseInt(process.env.MAX_PAGE_NUMBER);
    const INTERVAL_IN_MINUTES = parseInt(process.env.INTERVAL_IN_MINUTES);
    var m = moment(new Date(start).toISOString());
    var roundDown = moment(m.startOf('minute'));
    var roundUp = moment(m.startOf('minute')).add(INTERVAL_IN_MINUTES, "minutes");
    var s = new Date(roundDown).toISOString();
    var e = new Date(roundUp).toISOString();
    var isAfter = moment(e).isAfter(end);
    log.info(`${e} - ${end}`);
    if (isAfter) {
        return count;
    }
    var params = {
        q: `date:[${s} TO ${e}]`,
        per_page: PER_PAGE,
        page
    }
    try {
        const r = await management.logs.getAll(params);
        if (r.length > 0) {
            //console.log(r);
            count += r.length;
            fs.writeFile(`logs/${r[0].date}.json`, JSON.stringify(r), "utf8", (err) => {
                if (err) log.error(err);
                log.info("File saved!");
            });
            //console.log(response);
        }
        log.info(`Processed Logs ${count}, query: ${JSON.stringify(params)}`);
        if (start !== end) {
            // We have more results to collect...
            page = (page >= MAX_PAGE_NUMBER) ? 0 : (page+1);
            await new Promise((resolve) => setTimeout(resolve, 500));
            return getLogs(management, e, end, page, count);
        } else {
            return count;
        }
    } catch (e) {
        log.error({err: e}, 'Auth0 returned back error, gracefully erroring out returning what we have so far in response object.');
        return count;
    }
}
module.exports = async () => {
    const management = new ManagementClient({
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
    });
    const START_DATE = process.env.START_DATE;
    const END_DATE = process.env.END_DATE;
    try {
        await getLogs(management, START_DATE, END_DATE, 0, 0);
        log.info('Completed Exporting the logs');
    } catch (err) {
        log.error({ err }, 'Error processing logs');
        throw err;
    }
}
