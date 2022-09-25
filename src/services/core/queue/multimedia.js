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
     * Prepares MultimediaQueue
     * @constructor
     * @memberof Core
     */
    constructor(){
    }
    /** Runs a job with our multimedia Queue
     * @public
     * @async
     * @function
     * @memberof Core
     * @param {{action: String, job: Function, options: Object}} payload payload
     */
    async run(payload) {
        //classification should always be "MULTIMEDIA"
        let { classification, job, options } = payload
        if (classification === 'MULTIMEDIA'){
            //TODO: what do do I gotta do?
            //Do job and pass data as argument
            job(options)
            this.#doStuff(data)
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
     * What happens when the Queue's job has an error?
     * @public
     * @function
     * @memberof Core
     * @param error Error from queue 
     * @returns
     */
    onErrorListener(error) {
        return {
        }
    }

    /**
     * What happens when the Queue's job is active
     * @public
     * @function
     * @memberof Core
     * @param job queue job function
     * @returns
     */
    onActiveListener(job) {
        return {
        }
    }
    /**
     * What happens when the Queue's job is stalled
     * @public
     * @function
     * @memberof Core
     * @param {any} job queue job function
     * @returns
     */
    onStalledListener(job) {
        return {
        }
    }
    /**
     * What happens when the Queue's job is making progress
     * @public
     * @function
     * @memberof Core
     * @param {any} job queue job function
     * @param {any} progress queue progress
     * @returns
     */
    onProgressListener(job, progress) {
        // A job's progress was updated!
        // if (progress === 100) {
        //     self.setJob(job)
        // }
        return {
        }
    }
    /**
     * What happens when the Queue's job failed
     * @public
     * @function
     * @memberof Core
     * @param {any} job queue job function
     * @param {any} err queue err
     * @returns
     */
    onFailedListener(job, err) {
        //Call some self.failJob(job) //Fail job you want to run when quemanager tells you your queue got its failed function called
        return {
        }
    }
    /**
     * What happens when the Queue's job is removed
     * @public
     * @function
     * @memberof Core
     * @param {any} job queue job function
     * @returns
     */
    onRemovedListener(job) {
        //A job successfully removed...so do what now?
        return {
        }
    }

    //checkFFMPEGFinishedMakingSingleVideo()
    //mege?

}

module.exports = new MultimediaQueue()