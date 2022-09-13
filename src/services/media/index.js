let lastActive = Date.now();
let videoBot;
let { exec } = require('child_process');
const exportPath = './output/videos/';
/**
 * Class that has the commands that runs the video editing
 * @see FFMPEG
 */
//Written like this so the video processing runs on another process.
class VideoBot {

    constructor(payload) {
        //TODO:Set  output url
    }
    /**
     * Gets currentProcess Uptime
     * @returns {Object} An object with Uptime and last active
     */
    getProcessUptime() {
        const msg = { uptime: process.uptime(), lastActive };
        return new Promise((resolve, reject) => {
            process.send(msg);
            resolve(msg);
        });
    }
    /**
     * This function does the command line work and sends the result to the parent Process to store
     * @param {URL} image Image URL
     * @param {URL} audio AUDIO URL
     * @param {String} filename What do you want to name the video that it makes?
     * @returns void
     */
    makeVideoFromImage(image, audio, filename) {
        //Exec takes memory because it's buffering the data not streaming.
        //Also avoid exec if you're using user input to run the command line because of command injection attack
        //Cannot handle interactive shell so it'll hold if the file already exist.
        let outputURL = exportPath + filename + '.mkv';
        let msg;
        //TODO: THROBBER ("Scanning comments")
        exec(`ffmpeg -loop 1 -i ${image} -i ${audio} -shortest -acodec copy -vcodec mjpeg ${outputURL}`, (err, stdout, stderr) => {
            if (err) {
                console.log("ERR", err);
                process.send({ err: err })
                return;
            }
            msg = { video: `${outputURL}`, uptime: this.getProcessUptime(), lastActive: Date.now() }
            process.send(msg)
            return;
        });
        //TODO: SUCCESS THROBBER ("Finished Scanning comments");
        return;
    }

    /**
     * This function uses command line to merge multiple videos as a single video.
     * @param {{videoURLs: [URL], filename: String}} payload 
     * @returns void
     */
    /*

    ==================================================
                CLI COMMAND TO MERGE VIDEOS 
    ==================================================
    ffmpeg -i input1.mp4 -i input2.webm -i input3.mov \
    -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0][2:v:0][2:a:0]concat=n=3:v=1:a=1[outv][outa]" \
    -map "[outv]" -map "[outa]" output.mkv
    ==================================================
    */

    /**
    * Runs the CLI command to merge the videos. 
    * @param {{videoURLs:[URL],filename: String}} payload 
    * @returns void
    */
    //Complexity here man n^2 already
    //most likely also use more memory than usual
    mergeVideos(payload) {
        const { videoURLs, filename } = payload;
        let command = 'ffmpeg '
        let inputFiles = '';
        let defaultExtension = '.mkv'
        videoURLs.forEach(videoURL => {
            // inputFiles.concat(['-i ', videoURL])
            inputFiles += '-i ' + videoURL + ' '
        })
        command += inputFiles + '\\';
        command += '-filter_complex \"';

        //ph = pattern holder
        let ph = 0
        for (let i = 0; i < videoURLs.length; i++) {
            command += ph < 1 ? `[${i}:v:${i}][${i}:a:${i}]` : `[${ph}:v:0][${ph}:a:0]`;
            ph++;
        }
        command += `concat=n=${videoURLs.length}:v=1:a=1[outv][outa]\" \\`
        command += `-map \"[outv]\" -map \"[outa]\" ${exportPath + filename + defaultExtension}`
        let msg;

        //TODO: THROBBER ("Making video")
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log("ERR", err);
                process.send({ err: err })
                return;
            }
            msg = { mergedVideo: `${exportPath + filename}`, uptime: this.getProcessUptime(), lastActive: Date.now() }
            console.log("Merged Video at ", msg.mergedVideo + defaultExtension)
            process.send(msg)
            return;
        });
        //TODO: SUCCESS THROBBER ("Finished Creating video")
        return;
    }
}
/**
 * Handles messages that comes from the parent process.
 * @param {Object} message
 * @return {{video?:String, uptime?:String, lastActive?: Date}} Object containing data 
 */
process.on('message', async (msg) => {
    if (msg.action && msg.action === 'joinAudioToImage') {
        return await joinAudioToImageHandler(msg);
    } else if (msg.action && msg.action === 'mergeVideos') {
        return await mergeVideoHandler(msg);
    }
});
/**
 * Joins Audio with still image to make a video that is the length of the audio
 * @param {{image:URL, audio:URL, filename:String}} msg 
 * @returns void
 */
function joinAudioToImageHandler(msg) {
    const { image, audio, filename } = msg
    videoBot = new VideoBot(msg);
    videoBot.makeVideoFromImage(image, audio, filename);
}

/**
 * Merges multiple videos to make one
 * @param {{videoURLs:[URL],filename: String}} msg payload
 * @returns void
 */
function mergeVideoHandler(msg) {
    const { videoURLs, filename } = msg;
    videoBot = new VideoBot(msg);
    videoBot.mergeVideos({ videoURLs, filename });
}
