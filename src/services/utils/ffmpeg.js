const { fork } = require('child_process');
const Throbber = require('../../helpers').Throbber;
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
    /**
     * If any function calls our  {@link joinImageAndAudio}, then #joiningImageAndAudioInProgress increases by 1. It decreases if the function fails or is successful.
     * @private
     * @static
     * @member
     */
    #joiningImageAndAudioInProgress = 0
    /**
     * @constructor
     * @memberof Multimedia
     */
    /**
     * Lets you know if FFMPEG has joined ImageToAudio yet
     * @private
     * @member
     */
    #joinedImageAndAudio = false
    /**
     * Lets you know if FFMPEG is ready to merge multiple videos as one video. It will be false if other FFMPEG that will affect merge result is currently running.
     * @private
     * @static
     * @member
     */
    #readyToMerge = false
    /**
     * Lets you know if FFMPEG is currently merging multiple videos to form one
     * @private
     * @member
     */
    #mergingVideos = false
    /**
     * Lets you know if FFMPEG has merged multiple videos to form one
     * @private
     * @member
     */
    #mergedVideo = false
    
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
        const self = this
        self.#readyToMerge = false;
        Throbber.init('MAKING SINGLE COMMENT VIDEO :', filename)
        try {
            self.#joiningImageAndAudioInProgress += 1
            const childProcess = fork('./src/services/multimedia');
            childProcess.uptime = 0;
            childProcess.lastActive = Date.now();
            childProcess.on('message', (message) => {
                Throbber.init('About to Finish making single video')
                if (message.uptime) {
                    childProcess.uptime = message.uptime;
                    childProcess.lastActive = message.lastActive;
                }
                self.#videoURL = message && message.video ? message.video : false
                self.#joiningImageAndAudioInProgress -= 1
                self.#readyToMerge = true
                self.#joinedImageAndAudio = true
                Throbber.succeed('FINISHED MAKING SINGLE VIDEO :' + filename)
                if (self.#videoURL !== false) self.#videoURLS.push(self.#videoURL);
                return self.#videoURL;
            });
            let msg = { action: 'joinAudioToImage', image: image, audio: audio, filename: filename, Throbber: Throbber }
            childProcess.send(msg)
        } catch (err) {
            Throbber.fail('FAILED MAKING SINGLE COMMENT VIDEO :', filename)
            console.log('====================================');
            console.log("MAJOR ERROR", err);
            console.log('====================================');
        }
        if(self.#joinedImageAndAudio)Throbber.succeed('FINISHED MAKING SINGLE VIDEO :' + filename)
    }
    /**
     * Merges a bunch of videos together as one. 
     * @public
     * @function
     * @param {[URL]} videos filepath to each video you want to merge
     * @param {URL} filename What do you want to name the file? (No Extensions)
     * @memberof Multimedia
     * @returns {Void} 
     */
    mergeVideos(videos, filename) {
        let self = this;
        if (self.#readyToMerge) {
            Throbber.init('MERGING VIDEOS TO : ' + filename)
            try {
                self.#mergingVideos = true
                self.#mergedVideo = false
                const childProcess = fork('./src/services/multimedia');
                childProcess.uptime = 0;
                childProcess.lastActive = Date.now();
                childProcess.on('message', (message) => {
                    if (message.uptime) {
                        childProcess.uptime = message.uptime;
                        childProcess.lastActive = message.lastActive;
                    }
                    self.#finalVideo = message && message.finalVideo ? message.finalVideo : false
                    self.#readyToMerge = false;
                    self.#mergedVideo = true
                    Throbber.succeed('FINISHED MERGING VIDEOS :' + self.#finalVideo)
                    return self.#finalVideo;
                });
                let msg = { action: 'mergeVideos', videoURLs: videos, filename: filename, Throbber: Throbber }
                childProcess.send(msg)
            } catch (err) {
                Throbber.fail('FAILED TO MERGE TO ' + filename)
                console.log('====================================');
                console.log("MAJOR ERROR", err);
                console.log('====================================');
            }
            if(this.hasMergedVideos())Throbber.succeed('FINISHED MERGING VIDEOS :' + self.#finalVideo)
        }
    }
    /**
     * Lets you know if FFMPEG has merged video
     * @public
     * @function
     * @memberof Multimedia
     * @returns {Boolean} true if merged, false otherwise
     */
    hasMergedVideos() {
        return self.#mergedVideo;
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
     * Lets you know if FFMPEG is currently working; Joining Image and Audio work.
     * @public
     * @function
     * @memberof Multimedia
     * @returns {Boolean} true if over 0 images are joining with respective audio to make video
     */
    isJoiningImageAndAudio() {
        return this.#joiningImageAndAudioInProgress > 0
    }
    /**
     * Lets you know if FFMPEG is ready to merge multiple videos to give one video. 
     * @public
     * @function
     * @memberof Multimedia
     * @returns {Boolean} true if ready, false otherwise
     */
    isReadyForMerge(){
        return this.#readyToMerge
    }
}

module.exports = new FFMPEG();