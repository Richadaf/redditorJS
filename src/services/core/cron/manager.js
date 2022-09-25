'use strict'

const multimediaCron = require('./multimedia')
const Throbber = require('../../../helpers/throbber')

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
     * Builds Cron Manager utilities library
     * @constructor
     * @memberof Core
     * @param {Object} opts
     */
    constructor(opts) {
        this.CRON_THROBBER = Throbber.start()
        this.#build(opts)
    }
    /**
     * Initialize CronManager
     * @public
     * @function
     * @async
     * @memberof Core
     */
    init() {
        this.CRON_THROBBER.succeed('REDDITOR-CRON Ready!')
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
        var crons = this.#getCrons();
        var functions = await this.#getFunctions(opts)
        var constants = await this.#getCronJobsEveryCronHas()
        var cronArrays = Object.keys(crons)

        //build cronManager library and attach it to node process
        await this.startSchedules(cronArrays, constants)
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
            MULTIMEDIA_CRON: multimediaCron.get()
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
                MULTIMEDIA_CRON: multimediaCron.minuteCronTask()
            },
            fifteen_minute_cron_jobs: {
                MULTIMEDIA_CRON: multimediaCron.fifteenMinutesCronTask()
            },
            daily_cron_jobs: {
                MULTIMEDIA_CRON: multimediaCron.dailyCronTask()
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
     * @typedef Cron
     * @type {Object} Cron Name
     * @property {number} age - the person's age
     * @property {Object.<String, _schedule>} schedule Cron's schedule.
     */
    /**
     * Starts the schedule for all system crons you provide.
     * Attaches all Crons's timely functions(minute,daily, e.t.c.) to internal system.
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {[String]} cronNames Names of crons you want to schedule
     */
    async startSchedules(cronNames) {
        var crons = await this.#getCrons()
        var constants = this.#getCronJobsEveryCronHas();
        cronNames.map(async q => {
            //EVERY CRON HAS MINUTE, FIFTEEN_MINUTES AND DAILY PREDEFINED

            //EVERY MINUTE
            crons[q].schedule('* * * * *', function () {
                // console.log(`running a ${q} task every minute`);
                //EVERY CRON JOB IN THE SYSTEM HAS A minute_cron_job function with tasks that should run every minute
                constants.minute_cron_jobs[q]()
            });

            //EVERY 15 MINUTES
            crons[q].schedule('*/15 * * * *', function () {
                // console.log(`running a ${q} task every 15 minutes`);
                constants.fifteen_minute_cron_jobs[q]()
            });

            //EVERY DAY
            crons[q].schedule('0 0 3 * * *', function () {
                // console.log(`running a ${q} task every day at 3am`);
                constants.daily_cron_jobs[q]()
            });
        })
    }
    /**
     * Schedule task to one of our many system crons. {@see {@link Cron}}
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {String} cron_name name of system cron you want use to schedule your task. E.g Multimedia, Billing, e.t.c.
     * @param {{cronExpression: String, task: Function}} cronExpression 
     * @returns {ScheduledTask} Scheduled Task
     */
    async scheduleTask(cron_name, payload) {
        let { cronExpression, task } = payload
        await this.#getCrons()[cron_name].schedule(cronExpression, task)
    }
    /**
     * Schedules a Task from our Cron system.
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {ScheduledTask} ScheduledTask task instance you got when you scheduled the task
     * @returns {ScheduledTask} updated ScheduledTask instance.
     */
    //TODO: Are you sure this is async? I think it isn't.
    async unscheduleTask(ScheduledTask) {
        return ScheduledTask.stop();
    }
}

module.exports = new CronManager();