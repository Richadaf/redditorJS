const {CRON_TIME_PERIODS, generateCronExpression} = require('../../../helpers').CronJob
/**
 * Home for anything CRON operations relating to multimedia
 * @protected
 * @class
 */
class MultimediaCronJob {
    /**
     * @private
     * @const
     * @member
     */
    #MmCron = require('node-cron');
    /**
     * Gets MultimediaCronJob ready
     * @constructor
     * @memberof Core
     */
    constructor(){
    }
    /**
     * The Scheduled task
     * @typedef ScheduledTask
     * @external ScheduledTask
     * @type {Object}
     * @see {@link https://github.com/node-cron/node-cron/blob/master/src/scheduled-task.js}
     */
    /**
     * Get Multimedia cron
     * @public
     * @async
     * @function
     * @memberof Core
     * @returns {ScheduledTask} multimedia cron's schedule function.
     */
    async get() {
        return this;
    }
    /**
     * Schedules a task to the cron effective immediately.
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {String} cronExpression cronExpression that works with node-cron. {@see {@link https://github.com/node-cron/node-cron/}}
     * @param {Function} task task you want to perform
     * @returns {ScheduledTask} scheduled task
     */
    async scheduleTask(cronExpression, task){
        return this.#MmCron.schedule(cronExpression, task);
    }
    /**
     * Unschedule a task from the multimedia cron. Every x, t ({@see {@link scheduleTask}), task will STOP running.
     * @public
     * @async
     * @function
     */
    async unscheduleTask(){
        console.log("I kNOw you  wanna unschedule  task buy look at this", this.#MmCron.getTasks());
    }

    //TODO:returns jsdoc
    /**
     * This is what happens every minute for the multimedia cron
     * @public
     * @async
     * @function
     * @memberof Core
     * @returns {Promise<Void>}
     */
    async minuteCronTask() {
    }
    //TODO:returns jsdoc
    /**
     * This is what happens every fifteen minutes for the multimedia cron
     * @public
     * @async
     * @function
     * @memberof Core
     * @returns 
     */
    async fifteenMinutesCronTask() {

    }
    //TODO:returns jsdoc
    /**
     * This is what happens daily for the multimedia cron
     * @public
     * @async
     * @function
     * @memberof Core
     * @returns 
     */
    async dailyCronTask() {

    }
}
module.exports = new MultimediaCronJob()