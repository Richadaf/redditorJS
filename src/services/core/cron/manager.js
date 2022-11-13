'use strict'

const multimediaCron = require('./multimedia')
const Throbber = require('../../../helpers').Throbber;
const { CRON_TIME_PERIODS, generateCronExpression } = require('../../../helpers').CronJob

/**
 * We have multiple crons responsible for different types of tasks in the system.
 * {@link CronManager} provides a utilities library that holds our {@link Cron}s 
 * and helper function for managing cron related activities in case of system wide updates, maintenance or changes.
 * 
 * The CronManager attaches a CRON object to node process containing our Cron Manager Library'. It looks similar to this:
 * @example
    process.REDDITOR_CRON: {
        //Cron available times and instructions
        minute_cron_jobs: {{cron_name: instruction()}, {some_cron_name: instruction()}, ...}
        daily_cron_jobs: {{cron_name: instruction()}, {some_cron_name: instruction()}, ...}
                        ...
        //Cron manager functions
        function_name_that_belong_to_cron_manager: the_function(), //see #getFunctions(opts)
                        ...
        //Crons and their schedule
        some_cron_name: schedule(),
        other_cron_name: schedule(),
        ever_other_cron_name: schedule(),
    }
 * @protected
 * @class
 */
class CronManager {
    /**
     * Console Throbber for logging and debugging purposes
     * @private
     * @member
     */
    #CRON_THROBBER

    /**
     * Lets you know if cron manager has built(ran constructor) at least once.
     * @private
     * @member
     */
    #hasInit = false;
    /**
     * Builds Cron Manager utilities library
     * @constructor
     * @memberof Core
     * @param {Object} opts
     */
    constructor(opts) {
        this.#CRON_THROBBER = Throbber.get()
        //TODO: If system is ready, build lib ... System is ready when node has read the file the first round and process.REDDITOR_LAUNCHED = true;
        this.#build(opts)
        this.#hasInit = true;
    }
    /**
     * Initialize CronManager
     * @public
     * @function
     * @async
     * @memberof Core
     * @returns {Boolean} true if cron manager has initialized
     */
    init() {
        this.#CRON_THROBBER.succeed('REDDITOR-CRON Ready!')
        return this.#hasInit
    }
    /**
     * Puts all crons and their schedules together and attach it to process
     * @private
     * @async
     * @function
     * @memberof Core
     * @param {Object} opts 
     */
    async #build(opts) {
        var crons = await this.#getCrons();
        var functions = await this.#getFunctions(opts)
        var constants = await this.#getCronJobsEveryCronHas()
        var cronArrays = Object.keys(crons)
        // For each cron in our system
        cronArrays.map(async c => {
            //build cronManager library and attach it to node process
            //Attach all schedules to all crons in the system
            await this.scheduleTaskForCron(c, generateCronExpression(1, CRON_TIME_PERIODS.MINUTE), constants['minute_cron_jobs'])
            await this.scheduleTaskForCron(c, generateCronExpression(15, CRON_TIME_PERIODS.MINUTE), constants['fifteen_minute_cron_jobs'])
            await this.scheduleTaskForCron(c, generateCronExpression(1, CRON_TIME_PERIODS.DAY), constants['daily_cron_jobs'])

        })
        var utils = Object.assign(crons, Object.assign(functions, constants))
        Object.assign(this, utils)
        process.REDDITOR_CRON = this
    }
    /**
     * Internal Cron Schedule function
     * @callback _schedule
     * @param {String} cronExpression cron expression. Like '* * * * *'. You get?
     * @param {taskToSchedule | String } callback What do you want to schedule?
     * @param {ScheduleOptions} options options for internal scheduler
     * @returns {ScheduledTask} Scheduled Task
     */

    /**
     * The Scheduled task
     * @typedef ScheduledTask
     * @external ScheduledTask
     * @type {Object}
     * @see {@link https://github.com/node-cron/node-cron/blob/master/src/scheduled-task.js}
     */

    /**
     * The Schedule Options
     * @typedef ScheduleOptions
     * @prop {Boolean} [scheduled] if a scheduled task is ready and running to be
     *  performed when the time matches the cron expression.
     * @prop {String} [timezone] the timezone to execute the task in.
     * @type {Object}
     * @see {@link https://github.com/node-cron/node-cron/blob/master/src/node-cron.js}
     */

    /**
     * @typedef Cron
     * @type {Object.<String, _schedule>}
     */
    /**
     * Returns all crons defined in the system. Defined by {{cron_name: schedule()}, {cron_name: schedule()},...}
     * @private
     * @async
     * @function
     * @memberof Core
     * @return {Cron} Object of cron name and their schedule as values.
     */
    async #getCrons() {
        return {
            //To add new cron, define it here...
            //CLASSIFIER_CRON: someClassifierCron that comes from require('node-cron');
            MULTIMEDIA_CRON: await multimediaCron.get()
        }
    }
    /**
     * Gets cron jobs every cron MUST HAVE.
     * @private
     * @async
     * @function
     * @memberof Core
     * @returns {{minute_cron_jobs : Object, fifteen_minute_cron_jobs : Object , daily_cron_jobs : Object}} Object containing respective functions.
     */
    async #getCronJobsEveryCronHas() {
        return {
            minute_cron_jobs: {
                // MULTIMEDIA_CRON is the name of ONE CRON for our system.The system can handle multiple CRONS.
                MULTIMEDIA_CRON: await multimediaCron.minuteCronTask()
            },
            fifteen_minute_cron_jobs: {
                MULTIMEDIA_CRON: await multimediaCron.fifteenMinutesCronTask()
            },
            daily_cron_jobs: {
                MULTIMEDIA_CRON: await multimediaCron.dailyCronTask()
            }
        }
    }
    /**
     * Functions that belongs to our CronManager library
     * @private
     * @async
     * @function
     * @memberof Core
     * @param {*} opts options
     * @returns {Object} object containing functions
     */
    async #getFunctions(opts) {
        return {
            debug: opts && opts.debug
        }
    }
    /**
     * Sets the cronjob schedule for all system crons you provide.
     * Attaches all Crons's timely functions(minute,daily, e.t.c.) to internal system.
     * @private
     * @async
     * @function
     * @memberof Core
     * @param {[String]} cronNames Names of crons you want to schedule
     * @param {String} cronExpression cronExpression that works with node-cron. {@see {@link https://github.com/node-cron/node-cron/}} 
     * @param {String} task task that you want to perform
     * @return {Promise<Void>}
     */
    //All cron names you pass here will schedule the same task at the same schedule. You can make it different schedules too .
    async #scheduleTask(cronNames, cronExpression, task) {
        var crons = await this.#getCrons()
        cronNames.map(async q => {
            crons[q].scheduleTask(cronExpression, task);
        })
    }
    /**
     * Sets the cronjob schedule for the system crons you provide.
     * Attaches all Crons's timely functions(minute,daily, e.t.c.) to internal system.
     * @protected
     * @async
     * @function
     * @memberof Core
     * @param {String} cronName Names of crons you want to schedule
     * @param {String} cronExpression cronExpression that works with node-cron. {@see {@link https://github.com/node-cron/node-cron/}} 
     * @param {String} task task that you want to perform
     * @return {ScheduledTask}
     */
    //All cron names you pass here will schedule the same task at the same schedule. You can make it different schedules too .
    async scheduleTaskForCron(cronName, cronExpression, task) {
        cronName = cronName.slice(-5) != '_CRON'? cronName + '_CRON': cronName;
        var crons = await this.#getCrons()
        return crons[cronName].scheduleTask(cronExpression, task);
    }
    //TODO: Function start task
    /**
     * Starts the schedule for all system crons you provide.
     * It doesn't need to ask you what cron you want to use to exit the task. It already knows what cron the task is connected to and it'll proceed as supposed.
     * @protected
     * @async
     * @function
     * @memberof Core
     * @param {ScheduledTask} task task that you want to perform
     * @return {Promise<Void>}
     */
    async startTask(task) {
        return task.start();
    }
    /**
     * Stops the schedule for all system crons you provide.
     * It doesn't need to ask you what cron you want to use to exit the task. It already knows what cron the task is connected to and it'll proceed as supposed.
     * @protected
     * @async
     * @function
     * @memberof Core
     * @param {ScheduledTask} task task that you want to perform
     * @return {Promise<Void>}
     */
    async stopTask(task) {
        return task.stop();
    }

    //TODO: DELETE THESE COMMENTS
    // /**
    //  * Schedule task to one of our many system crons. {@see {@link Cron}}
    //  * @public
    //  * @async
    //  * @function
    //  * @memberof Core
    //  * @param {String} cron_name name of system cron you want use to schedule your task. E.g Multimedia, Billing, e.t.c.
    //  * @param {{cronExpression: String, task: Function}} cronExpression 
    //  * @returns {ScheduledTask} Scheduled Task
    //  */
    // async scheduleTask(cron_name, payload) {
    //     let { cronExpression, task } = payload
    //     const cron_full_name = cron_name + '_CRON'
    //     const systemCrons = await this.#getCrons()
    //     systemCrons[cron_full_name].schedule(cronExpression, task)
    // }
    /**
     * Unschedule a Task from our Cron system.
     * It doesn't need to ask you what cron you want to use to exit the task. It already knows what cron the task is connected to and it'll proceed as supposed.
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {ScheduledTask} scheduledTask ScheduledTask instance you got when you scheduled the task
     * @returns {ScheduledTask} updated ScheduledTask instance.
     */
    async unscheduleTask(scheduledTask) {
        return scheduledTask.stop();
    }
}

module.exports = new CronManager();