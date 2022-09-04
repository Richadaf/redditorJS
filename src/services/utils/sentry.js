const config = require('../../config');
const SentryClient = require('@sentry/node');

class Sentry {
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
