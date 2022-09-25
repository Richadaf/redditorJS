const ora = require('ora');
/**
 * @protected
 * @class
 * @classdesc Custom Console Throbber
 */
class Throbber {
    /**
     * Internal app throbber
     * @private
     * @member
     */
    #appStartThrobber
    /**
     * Gets elegant console throbber ready
     * @constructor
     * @memberof Helper
     */
    constructor() {
        this.#appStartThrobber = ora(); 
    }
    /**
     * Initializes with a message of your choice
     * @public
     * @function
     * @memberof Helper
     * @param {String | undefined} msg message you want to display
     */
    init(msg){
        //You should not be exposing ORA
        let done = msg ? this.#appStartThrobber.start(msg) : this.#appStartThrobber.start();
    }
    /**
     * Displays a YES/SUCCESS message 
     * @public
     * @function
     * @memberof Helper
     * @param {String} msg message to display
     */
    succeed(msg) {
        this.#appStartThrobber.succeed(msg)
    }

    /**
     * Displays a MAYBE/WARN message 
     * @public
     * @function
     * @memberof Helper
     * @param {String} msg message to display
     */
    warn(msg) {
        this.#appStartThrobber.warn(msg)
    }

    /**
     * Displays a NO/FAIL message
     * @public
     * @function 
     * @memberof Helper
     * @param {String} msg message to display
     */
    fail(msg) {
        this.#appStartThrobber.fail(msg)
    }
}

module.exports = new Throbber();