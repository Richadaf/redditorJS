const ora = require('ora');
/**
 * Custom Console Throbber
 */
class Throbber {

    #appStartThrobber

    constructor() {
        this.#appStartThrobber = ora(); 
    }
    /**
     * Initializes with a message of your choice
     * @param {String | undefined} msg message you want to display
     */
    init(msg){
        //You should not be exposing ORA
        let done = msg ? this.#appStartThrobber.start(msg) : this.#appStartThrobber.start();
    }

    /**
     * Starts with message 
     */
    /**
     * Displays a YES/SUCCESS message 
     * @param {String} msg message to display
     */
    succeed(msg) {
        this.#appStartThrobber.succeed(msg)
    }

    /**
     * Displays a MAYBE/WARN message 
     * @param {String} msg message to display
     */
    warn(msg) {
        this.#appStartThrobber.warn(msg)
    }

    /**
     * Displays a NO/FAIL message 
     * @param {String} msg message to display
     */
    fail(msg) {
        this.#appStartThrobber.fail(msg)
    }
}

module.exports = new Throbber();