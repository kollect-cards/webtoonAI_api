const CronJobManager = require('cron-job-manager');
const Common = require("../helpers/common");
manager = new CronJobManager();
manager.add('cronSample', '0 17 * * *', async () => {
    Common.logData('      : cronSample start . . . ');
    try {
    }catch (e) {
        // Sentry.captureException(e);
    }
    Common.logData('      : cronSample finish . . . ');
});
manager.start('cronSample');