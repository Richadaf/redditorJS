/**
 * Helper functions for anything that has to do with CronJobs
 */
/**
 * Time periods our cron understands. E.g Second, Minute, Day, Month, Year 
 * @public
 * @static
 * @const
 * @memberof Helper
 * @enum {Number}
 */
exports.CRON_TIME_PERIODS = {
    SECOND: 1,
    MINUTE: 2,
    DAY: 3,
    MONTH: 4,
    YEAR: 5,
}
/**
 * Returns a valid cron Expression for our system
 * A cron expression is a string that lets cronjobs know how often to run a task for.
 * 
 * This returns a cron expression signifying instruction: Every x t, where x is number and t is timeframe{m,s,h,d,y}"
 * @example
 * cronExpression(2,CRON_TIME_PERIODS['MINUTE']) //returns cron expression for every two minutes: '*\/2 * * * *'
 * @public
 * @function
 * @memberof Helper
 * @param {Number} x every x {@link CRON_TIME_PERIODS} where x is a number.
 * @param {CRON_TIME_PERIODS} t time period
 * @return {String} cronExpression that works with node-cron. {@see {@link https://github.com/node-cron/node-cron/}}
 */
exports.generateCronExpression = (x, t) => {
    if (t === this.CRON_TIME_PERIODS['MINUTE']) {
        return '*/' + x + ' * * * *';
    } else if (t === this.CRON_TIME_PERIODS['DAY']) {
        return '*/* * ' + x + ' * *';
    }
    return '';
}
