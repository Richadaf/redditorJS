const CRONJOB_HELPER_FUNCTIONS = require('./cronjob')
const THROBBER_HELPER_CLASS = require('./throbber')
const Throbber = new THROBBER_HELPER_CLASS();

/**
 * Generates Random String with specified length
 * @public
 * @const
 * @function
 * @member
 * @memberof Helper
 * @param {Number} length number of characters you want for your random string.
 * @return {String} random string
 */
generateRandomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
        return result;
    }
}

module.exports = {
    //CRONJOB_HELPER_FUNCTIONS is a helper ES module. (module.exports)
    CronJob: CRONJOB_HELPER_FUNCTIONS,
    //Throbber is a helper class instance.(Helper.Throbber), where Helper is a namespace
    Throbber: Throbber,
    generateRandomString
}
