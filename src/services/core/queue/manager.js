'use strict'
const Queue = require('bull');
const Throbber = require('../../../helpers/throbber')
const multimediaQueue = require('./multimedia')
const MULTIMEDIA_QUEUE = new Queue('REDDITOR-MULTIMEDIA-QUEUE', opts); // Specify Redis connection using object


/**
 * We have services that want to run tasks/jobs one after the other. {@link QueueManager} organizes all tasks for all services into a queue library and attaches it to {@link process}.
 * Very useful for managing first in first out activities throughout the system.
 * @protected
 * @class
 * 
 * @example
    process.REDDITOR_QUEUE: {
        //queue compulsory details
        statusRunning: { status: { process: { running: true, completed: false } } },
        statusCompleted: { status: { process: { running: false, completed: true } } },
        statusSuccess: { status: { process: { running: false, completed: true } }, results: { last_success_at: new Date(), last_fail_at: null } },
        statusFail: { status: { process: { running: false, completed: false } }, results: { last_success_at: null, last_fail_at: new Date() } }

        debug: opts && opts.debug
        minute_crons: {{cron_name: instruction()}, {some_cron_name: instruction()}, ...}
                        ...
        //Cron manager functions
        function_name_that_belong_to_cron_manager: the_function(), //see #getFunctions(opts)
                        ...
        //Crons and their schedule
        some_cron_name: schedule(),
        other_cron_name: schedule(),
        ever_other_cron_name: schedule(),
    }
 */
//TODO: CHANGE NAMESPACE BACK TO QUEUE AS NORMAL
class QueueManager {
    /**
     * Puts all queues together and attach it to process
     * @constructor
     * @memberof Core
     * @param {Object} opts 
     */
    constructor(opts) {
        this.QUEUE_THROBBER = Throbber.start()
        this.#build(opts)
    }
    /**
     * Puts all queues together and attach it to process
     * @private
     * @async
     * @function
     * @memberof Core
     * @param {Object} opts 
     */
    async #build(opts) {
        const queues = this.#getQueues()
        var functions = this.#getFunctions(opts)
        var constants = this.#getConstants()
        const queuesArray = Object.keys(queues)

        //build queueManager library and attach it to node process
        await this.addAllListeners(queuesArray, queues)
        const utils = Object.assign(queues, Object.assign(functions, constants))
        Object.assign(this, utils)
        process.REDDITOR_QUEUE = this
        process.REDDITOR_QUEUE.QUEUES = await this.#getQueues()
    }
    /**
     * Returns all queues defined in the system. Defined by {{queue_name: Queue.Queue}, {queue_name: Queue.Queue},...}
     * @private
     * @async
     * @function
     * @memberof Core
     * @return {Object.<String, Queue.Queue>} Object of queue name and our internal Queue as values.
     */
    #getQueues() {
        return {
            MULTIMEDIA_QUEUE: MULTIMEDIA_QUEUE,
        };
    }
    /**
    * Gets queue property that exists universally across all types of queues (Multimedia Queue,...) g. E.g {process.running: Boolean}, {process.completed: Boolean}
    * @private
    * @async
    * @function
    * @memberof Core
    * @returns {{statusRunning : {status: { process: {running: Boolean, completed: Boolean }}}, statusCompleted : {status: { process: {running: Boolean, completed: Boolean }}} , statusSuccess : {status: { process: {running: Boolean, completed: Boolean }}, results: { last_success_at: Date | undefined, last_fail_at: Date | undefined }}, statusFail: {status: { process: {running: Boolean, completed: Boolean }}, results: { last_success_at: Date | undefined, last_fail_at: Date | undefined }}}}
    */

    #getConstants() {
        return {
            //MULTIMEDIA_QUEUE is one queue in our system. The system can handle multiple queues
            MULTIMEDIA_QUEUE: multimediaQueue.info
        };
    }
    /**
     * Functions that belongs to our QueueManager library 
     * @private
     * @async
     * @function
     * @memberof Core
     * @param {*} opts options
     * @returns {Object} object containing functions
     */
    #getFunctions(opts) {
        return {
            debug: opts && opts.debug
        };
    }
    /**
     * Attaches all Queue's work functions (active, stalled, error) to internal system.
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {[String]} queuesArray An array containing the names of all the queues you want to add 
     * @param {Object.<String, Queue.Queue>} queues object of queue name and our internal Queue as values. 
     */
    async addAllListeners(queuesArray, queues) {
        const self = this
        queuesArray.map(async q => {
            queues[q].on('error', function (error) {
                // An error occurred.
                //SEND A NOTIFICATION
                multimediaQueue.onErrorListener(error);

            })

            queues[q].on('active', async function (job) {
                multimediaQueue.onActiveListener(job)
            })

            queues[q].on('stalled', function (job) {
                // A job has been marked as stalled. This is useful for debugging job
                // workers that crash or pause the event loop.
                multimediaQueue.onStalledListener(job)
            })

            queues[q].on('progress', function (job, progress) {
                multimediaQueue.onProgressListener(job, progress)
            })

            queues[q].on('failed', function (job, err) {
                // A job failed with reason `err`!
                multimediaQueue.onFailedListener(job, err)
            })

            queues[q].on('removed', function (job) {
                // A job successfully removed.
                multimediaQueue.onFailedListener(job)
            });
        })
    }
    /**
     * Initializes Queue Manager
     * @public
     * @function
     * @memberof Core
     */
    init() {
        //process.NOTIFICATIONS_SOCKET.to().send(this.getQueueManager)
        this.QUEUE_THROBBER.succeed('REDDITOR-QUEUE Ready!')
    }
    /**
     * Returns Queues defined in the system, each containing their jobs
     * @private
     * @async
     * @function
     * @memberof Core
     * @returns {{jobs: Promise<[Object]>}} Queues defined in the system
     */
    async #getQueueManager() {
        const QUEUES = {
            MULTIMEDIA_QUEUE: { jobs: await process.REDDITOR_QUEUE['MULTIMEDIA_QUEUE'].getJobs() },
        }
        return QUEUES
    }
    
    /**
     * Deletes a Queue from QueueManager's system
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {String} classification queue classification. {@see {@link QueueClassification}}
     * @returns {Object} data
     */
    async deleteQueue(classification) {
        const allJobs = await process.OKRA_QUEUE[classification].getJobs() // all jobs in queue
        const done = await allJobs.filter(job => {
            job.remove()

            return job
        })
        if (done.length === 0) return { success: true, msg: 'Emptied the queue successfully!' }
        //TODO:THROW ERRORS should go somwthing along these lines (errors come from src/helpers/errors):
        // return errors.throw('empty_queue', queue)
        return { success: false, msg: 'Queue is already empty!', data: classification }
    }
    
    /**
     * Processes (starts, i think...) a job for a queue
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {String} classification queue classification (see {@link QueueClassification})
     * @param {Function} job 
     */
    async createJob(classification, job) { // process the job 
        const self = this;
        this.classification = classification.split('_')[0]
        await process.REDDITOR_QUEUE[classification].process(async () => {
            //Classifications for queue is like MULTIMEDIA, e.t.c. remember, that's where MULTIMEDIA_QUEUE came from.
            return self.#processJobForQueueClassification(self.classification, job)
        });

    }
    
    /**
     * Our QueueManager has multiple queues. E.g Multimedia queue, Billing queue, e.t.c. Multimedia and Billing in this example is the {@link QueueClassification}
     * @typedef QueueClassification
     * @type {{jobs: Promise<[Object]>}}
     */
    /**
     * Remember our system can have multiple queues in QueueManager. Let's call these instances {@link QueueClassification}.
     * this function uses the right queue out of the numerous queues in the system to run the job.
     * @private
     * @function
     * @memberof Core
     * @param {String} classification Name of Queue Classification. E.g. 'Multimedia', 'Billing', 'Advertising'
     * @param {Function} job job you want to run
     * @param {Object} options any extra data/arguments you want to pass
     * @returns 
     */
    #processJobForQueueClassification(classification, job) { // run appropiate process for queue
        switch (classification) {
            case 'MULTIMEDIA':
                return multimediaQueue.run({ classification, job })
                break
            default:
                break
        }
    }

}

module.exports = new QueueManager();
