const config = require('../../config');
const SentryClient = require('@sentry/node');
/**
 * Remote Error Logging Service
 * @protected
 * @class
 */
class Sentry {
    /**
     * Initializes connection with remote error logging service.
     * @constructor
     * @memberof ErrorLogging
     * @param {Object} options options
     * @param {*} user What user is are you creating this error logging connection for? This way we know what user is getting the error.
     */
    constructor(options = {}, user) {
        const {setup} = options;
        SentryClient.init({
            dsn: `https://${config.sentryToken}@o1394007.ingest.sentry.io/${config.sentryID}`,
            environment: config.env,
            user
        });

        process.Sentry = setup ? SentryClient : null
        return SentryClient
    }
}
module.exports = Sentry;
