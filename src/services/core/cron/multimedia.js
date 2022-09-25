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
     * @function
     * @memberof Core
     * @returns {ScheduledTask} multimedia cron's schedule function.
     */
    get() {
        return this.#MmCron;
    }

    //TODO:returns jsdoc
    /**
     * This is what happens every minute for the multimedia cron
     * @public
     * @async
     * @function
     * @memberof Core
     * @returns 
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