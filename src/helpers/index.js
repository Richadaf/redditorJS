/**
 * Generates Random String with specified length
 * @protected
 * @function
 * @memberof Helper
 * @param {Number} length number of characters you want for your random string.
 * @return {String} random string
 */
exports.generateRandomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
        return result;
    }
}