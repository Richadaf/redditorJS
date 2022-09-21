const { fork } = require('child_process');
const Throbber = require('../../helpers/throbber')
/**
 * Helper class for interacting with FFMPEG that is working in a child process
 */
class FFMPEG {
    /**
     * Single videoURL for working with a single video anywhere in the class
     */
    #videoURL
    /**
     * To hold all the urls for the images videos i'm merging
     */
    #videoURLS = []
    /**
     * Stores the final video that has merged from single clips
     */
    #finalVideo = false;

    constructor() {
    }
    /**
     * Joins Image and Audio to form a video. Video is the length of the audio.
     * @param {URL} image url to the image
     * @param {URL} audio url to the audio
     * @param {String} filename What do you want to name the video?
     * @returns {URL | Boolean} url to the finished product, or false if there's an error
     */
    joinImageAndAudio(image, audio, filename) {
        Throbber.init('MAKING SINGLE COMMENT VIDEO :', filename)
        try {
            const childProcess = fork('./src/services/media');
            childProcess.uptime = 0;
            childProcess.lastActive = Date.now();
            childProcess.on('message', (message) => {
                if (message.uptime) {
                    childProcess.uptime = message.uptime;
                    childProcess.lastActive = message.lastActive;
                }
                this.#videoURL = message && message.video ? message.video : false
                if (this.#videoURL !== false) this.#videoURLS.push(this.#videoURL);
                Throbber.succeed('FINISHED MAKING SINGLE VIDEO :' + filename)
                return this.#videoURL;
            });
            let msg = { action: 'joinAudioToImage', image: image, audio: audio, filename: filename, throbber: Throbber }
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
     * @param {[URL]} videos filepath to each video you want to merge
     * @param {URL} filename What do you want to name the file? (No Extensions)
     */
    mergeVideos(videos, filename) {
        Throbber.init('MERGING VIDEOS TO : ' + filename)
        try {
            const childProcess = fork('./src/services/media');
            childProcess.uptime = 0;
            childProcess.lastActive = Date.now();
            childProcess.on('message', (message) => {
                if (message.uptime) {
                    childProcess.uptime = message.uptime;
                    childProcess.lastActive = message.lastActive;
                }
                this.#finalVideo = message && message.finalVideo ? message.finalVideo : false
                Throbber.succeed('MERGED VIDEOS TO : ' + filename)
                return this.#finalVideo;
            });
            let msg = { action: 'mergeVideos', videoURLs: videos, filename: filename }
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
     * @return {URL | Boolean} URL to finalVideo. False if not merged yet
     */
    getFinalVideo() {
        return this.#finalVideo;
    }
}

module.exports = new FFMPEG();