const ora = require('ora');
/**
 * Helper class for anything that has to with console logging.
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
        
    }
    /**
     * Initializes with a message of your choice
     * @public
     * @function
     * @memberof Helper
     * @param {String | undefined} msg message you want to display
     */
    init(msg) {
        this.#appStartThrobber = ora();
        this.#appStartThrobber.start(msg)
        return this;
    }
    /**
     * Initializes with a no message
     * @public
     * @function
     * @memberof Helper
     * @param {String | undefined} msg message you want to display
     */
    init(){
        this.#appStartThrobber = ora();
        this.#appStartThrobber.start()
        return this;
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
    /**
     * @typedef SystemThrobber
     * @type {{succeed: Function<String>, fail: Function<String>, stop: Function<String>, warn: Function<String>}} throbber utils
     */
    /**
     * A system throbber with it's functions
     * @public
     * @function
     * @memberof Helper
     * @return {SystemThrobber} throbber library
     */
    get() {
        return {
            succeed: (text) => { return this.#appStartThrobber.succeed(text) },
            fail: (text) => { return this.#appStartThrobber.fail(text) },
            stop: (text) => { return this.#appStartThrobber.stop(text) },
            warn: (text) => { return this.#appStartThrobber.warn(text) },
        }
    }
}

module.exports = Throbber;