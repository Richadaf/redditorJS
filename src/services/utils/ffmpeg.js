const { fork } = require('child_process');
const Throbber = require('../../helpers/throbber')
/**
 * Helper class for interacting with FFMPEG that is working in a child process
 * @public
 * @class
 */
class FFMPEG {
    /**
     * Single videoURL for working with a single video anywhere in the class
     * @private
     * @member
     */
    #videoURL
    /**
     * To hold all the urls for the images videos i'm merging
     * @private
     * @member
     */
    #videoURLS = []
    /**
     * Stores the final video that has merged from single clips as a url 
     * @private
     * @member
     */
    #finalVideo = false;
    /** Stores count of ffmpeg processes that is currently running and hasn't finished. For example, when you tell {@link ffmpeg} to {@link ffmpeg.joinImageAndAudio}, It'll start joining a child process and processes will increase by one. When it is done, processes will reduce by 1. Other functions in ffmpeg may also affect processes' value.
     * @private
     * @member
    */
    #processes = 0

    /**
     * @constructor
     * @memberof Multimedia
     */
    constructor() {
    }
    /**
     * Joins Image and Audio to form a video. Video is the length of the audio.
     * @public
     * @function
     * @param {URL} image url to the image
     * @param {URL} audio url to the audio
     * @param {String} filename What do you want to name the video?
     * @memberof Multimedia
     * @returns {URL | Boolean} url to the finished product, or false if there's an error
     */
    joinImageAndAudio(image, audio, filename) {
        Throbber.init('MAKING SINGLE COMMENT VIDEO :', filename)
        try {
            this.#processes += 1
            const childProcess = fork('./src/services/media');
            childProcess.uptime = 0;
            childProcess.lastActive = Date.now();
            childProcess.on('message', (message) => {
                if (message.uptime) {
                    childProcess.uptime = message.uptime;
                    childProcess.lastActive = message.lastActive;
                }
                this.#videoURL = message && message.video ? message.video : false
                this.#processes -= 1
                Throbber.succeed('FINISHED MAKING SINGLE VIDEO :' + filename)
                if (this.#videoURL !== false) this.#videoURLS.push(this.#videoURL);
                return this.#videoURL;
            });
            let msg = { action: 'joinAudioToImage', image: image, audio: audio, filename: filename, Throbber: Throbber }
            childProcess.send(msg)
        } catch (err) {
            Throbber.fail('FAILED MAKING SINGLE COMMENT VIDEO :', filename)
            console.log('====================================');
            console.log("MAJOR ERROR", err);
            console.log('====================================');
        }

    }
    /**
     * Merges a bunch of videos together as one. 
     * @public
     * @function
     * @param {[URL]} videos filepath to each video you want to merge
     * @param {URL} filename What do you want to name the file? (No Extensions)
     * @memberof Multimedia
     * @returns {URL} url for final merged video
     */
    mergeVideos(videos, filename) {
        Throbber.init('MERGING VIDEOS TO : ' + filename)
        try {
            this.#processes += 1
            const childProcess = fork('./src/services/media');
            childProcess.uptime = 0;
            childProcess.lastActive = Date.now();
            childProcess.on('message', (message) => {
                if (message.uptime) {
                    childProcess.uptime = message.uptime;
                    childProcess.lastActive = message.lastActive;
                }
                this.#finalVideo = message && message.finalVideo ? message.finalVideo : false
                this.#processes -= 1
                Throbber.succeed('FINISHED MERGING VIDEOS :' + this.#finalVideo)
                return this.#finalVideo;
            });
            let msg = { action: 'mergeVideos', videoURLs: videos, filename: filename, Throbber: Throbber }
            childProcess.send(msg)
        } catch (err) {
            Throbber.fail('FAILED TO MERGE TO ' + filename)
            console.log('====================================');
            console.log("MAJOR ERROR", err);
            console.log('====================================');
        }
    }
    /**
     * Gets the url for the merged video
     * @public
     * @function
     * @memberof Multimedia
     * @return {URL | Boolean} URL to finalVideo. False if not merged yet
     */
    getFinalVideo() {
        return this.#finalVideo;
    }

    /**
     * Tells you if any FFMPEG function is running in the background.
     * @public
     * @function
     * @memberof Multimedia
     * @returns 
     */
    isWorking() {
        return this.#currentlyWorking;
    }
}

module.exports = new FFMPEG();