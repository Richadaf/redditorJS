const Queue = require('bull');
const CronManager = require('../cron/manager');
const Helpers = require('../../../helpers')
const FFMPEG = require('../../../services/utils/ffmpeg')
const fs = require('fs');
const config = require('../../../config')
const exportPathVideo = config.exportPathVideo;
const defaultFileNameLength = config.defaultFileNameLength
const redis = config.redis
/**
 * Home for anything Queue operations relating to multimedia
 * @protected
 * @class
 */
class MultimediaQueue {
    /**
     * Our system can handle multiple queues. {@link MultimediaQueue} is only one of them... one Classification of system Queues.
     * @private
     * @member
     */
    #classification = 'MULTIMEDIA'
    /**
     * External queue service we use
     * @private
     * @member
     */
    #queue = new Queue('REDDITOR-MULTIMEDIA-QUEUE', { redis: { port: redis.port, host: redis.host } }); // Specify Redis connection using object
    /**
     * Prepares MultimediaQueue
     * @constructor
     * @memberof Core
     */
    constructor() {
    }
    /**
     * Returns the multimedia queue
     * @public
     * @function
     * @memberof Core
     */
    get() {
        return this
    }
    /**
    * Adds some task to back of the multimedia queue. The event listeners will handle what happens if task is successful or not
    * @public
    * @async
    * @function
    * @memberof Core
    * @param {any} task queue task function
    * @param {any} callback callback function
    * @return {Promise<any>}
    */
    async addJob(job) {
        return this.#queue.add({ name: 'REDDITOR-MULTIMEDIA-QUEUE', job });
    }
    async empty() {
        return this.#queue.empty();
    }
    /** 
     * Processes the task at the front of the multimedia queue. The event listeners will handle what happens if task is successful or not
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {url: String, task: String} job job you want to add to queue, url is for redd
     * @param {Object} callback callback
     */
    async run(job) {
        this.#queue.process(this.#mergeVideos(job))
    }
    async #mergeVideos(job) {
        if (job.task == 'merge-video') {
            let videosToJoin = [];
            let commentsVideoPaths = fs.readdirSync(exportPathVideo);
            for (const path of commentsVideoPaths)
                videosToJoin.push('' + exportPathVideo + path);

            let url = job.url
            //SET name of file from reddit url. Max of 10 characters as filename
            let videoName = url.match(/([a-zA-Z]+(_[a-zA-Z]+)+)/)[0];
            let finalVideoName = videoName.length > defaultFileNameLength ? videoName.slice(0, defaultFileNameLength) : videoName;


            FFMPEG.mergeVideos(videosToJoin, finalVideoName); //TODO: NEEDS PROMISE
        }
    }
    /**
     * Displays critical information about the queue
     * @public
     * @function
     * @memberof Core
     * @returns {{statusRunning : {status: { process: {running: Boolean, completed: Boolean }}}, statusCompleted : {status: { process: {running: Boolean, completed: Boolean }}} , statusSuccess : {status: { process: {running: Boolean, completed: Boolean }}, results: { last_success_at: Date | undefined, last_fail_at: Date | undefined }}, statusFail: {status: { process: {running: Boolean, completed: Boolean }}, results: { last_success_at: Date | undefined, last_fail_at: Date | undefined }}}} 
     */
    info() {
        return {
            statusRunning: { status: { process: { running: true, completed: false } } },
            statusCompleted: { status: { process: { running: false, completed: true } } },
            statusSuccess: { status: { process: { running: false, completed: true } }, results: { last_success_at: new Date(), last_fail_at: null } },
            statusFail: { status: { process: { running: false, completed: false } }, results: { last_success_at: null, last_fail_at: new Date() } }
        }
    }
    /**
     * What happens when the Queue's task has an error?
     * @public
     * @function
     * @memberof Core
     * @param task Error from queue 
     * @returns
     */
    setOnErrorListener() {
        return this.#queue.on('error', (err) => {
            //Do stuff
            //TODO: LOG TO SENTRY THIS USER AND THE ERROR
        });
    }
    /**
     * What happens when the Queue's task is active
     * @public
     * @function
     * @memberof Core
     * @param task queue task function
     * @returns
     */
    onActiveListener() {
        return this.#queue.on('active', () => {
            //Do stuff
        })
    }
    /**
     * What happens when the Queue's task is stalled
     * @public
     * @function
     * @memberof Core
     * @param {any} task queue task function
     * @returns
     */
    onStalledListener() {
        return this.#queue.on('active', () => {
            //Do stuff
        })
    }
    /**
     * What happens when the Queue's task is making progress
     * @public
     * @function
     * @memberof Core
     * @param {any} task queue task function
     * @param {any} progress queue progress
     * @returns
     */
    onProgressListener() {
        // A task's progress was updated!
        // if (progress === 100) {
        //     self.setTask(task)
        // }
        return this.#queue.on('progress', (data) => {
            //Do stuff
        })
    }
    /**
     * What happens when the Queue's task failed
     * @public
     * @function
     * @memberof Core
     * @param {any} task queue task function
     * @param {any} err queue err
     * @returns
     */
    onFailedListener() {
        //Call some self.failTask(task) //Fail task you want to run when quemanager tells you your queue got its failed function called
        return this.#queue.on('failed', (data) => {
            //Do stuff
        })
    }
    /**
     * What happens when the Queue's task is removed
     * @public
     * @function
     * @memberof Core
     * @param {any} task queue task function
     * @returns
     */
    onRemovedListener() {
        //A task successfully removed...so do what now?
        return this.#queue.on('removed', (data) => {
            //Do stuff
        })
    }
    /**
     * What happens when the Queue's task is completed
     * @public
     * @function
     * @memberof Core
     * @param {any} task queue task function
     * @returns
     */
    onCompletedListener() {
        console.log("TASK COMPLETED, but thsi is the task ", task);
        console.log("TASK COMPLETED WITH RESULT ", result);
        //A task successfully completed...so do what now?
        //IF TASK IS 'MERGE_VIDEO'. Send a message to user that the video is ready and is at x.
        return this.#queue.on('completed', (data) => {
            //Do stuff
        })
    }

    //checkFFMPEGFinishedMakingSingleVideo()
    //mege?

}

module.exports = new MultimediaQueue()