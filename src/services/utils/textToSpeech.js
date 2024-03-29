const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const Throbber = require('../../helpers/').Throbber;
/**
 * Text to Speech class
 * @protected
 * @class
 */
class TextToSpeech {
    /**
     * @private
     * @member
     * External tool that processes commands for us.
     */
    #client = null;
    /**
     * Initializes internal services
     * @constructor
     * @memberof MixedRealityTools
     */
    constructor() {
        this.#client = new textToSpeech.TextToSpeechClient();
    }
    /**
     * Convert text to speech
     * @public
     * @async
     * @function
     * @memberof MixedRealityTools
     * @param {String} text What you want the system to say
     * @returns Buffer with binary audio
     */
    async say(text) {
        Throbber.init('SAYING COMMENT TO FILE')
        const request = {
            input: { text: text },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };
        const [response] = await this.#client.synthesizeSpeech(request);
        Throbber.succeed('SAID COMMENT') //logic?
        return response.audioContent;
    }
    /**
     * Save binary audio to file
     * @public
     * @async
     * @function
     * @memberof MixedRealityTools
     * @param {*} filename What are you naming the file (Add extension)
     * @param {*} binaryAudio BinaryAudio you want to save
     */
    async saveToFile(filename, binaryAudio){
        Throbber.init('SAVING AUDIO TO FILE')
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(filename, binaryAudio, 'binary');
        Throbber.succeed('SAVED AUDIO TO FILE')
    }
}

module.exports = new TextToSpeech();