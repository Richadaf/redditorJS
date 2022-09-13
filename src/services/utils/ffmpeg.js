let { fork } = require('child_process');
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
    #mergedVideo = false;

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
                return this.#videoURL;
            });
            let msg = { action: 'joinAudioToImage', image: image, audio: audio, filename: filename }
            childProcess.send(msg)
        } catch (err) {
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
        //TODO:remove extensions from filename if present. Is it a priority task tho?
        try {
            const childProcess = fork('./src/services/media');
            childProcess.uptime = 0;
            childProcess.lastActive = Date.now();
            childProcess.on('message', (message) => {
                if (message.uptime) {
                    childProcess.uptime = message.uptime;
                    childProcess.lastActive = message.lastActive;
                }
                this.#mergedVideo = message && message.mergedVideo ? message.mergedVideo : false
                return this.#mergedVideo;
            });
            let msg = { action: 'mergeVideos', videoURLs: videos, filename: filename }
            childProcess.send(msg)
        } catch (err) {
            console.log('====================================');
            console.log("MAJOR ERROR", err);
            console.log('====================================');
        }
    }
    /**
     * Gets the url for the merged video
     * @return {URL | Boolean} URL to mergedVideo. False if not merged yet
     */
    getMergedVideo() {
        return this.#mergedVideo;
    }
}

module.exports = new FFMPEG();