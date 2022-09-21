require('dotenv').config() 

module.exports = {
    port: process.env.PORT,
    app: process.env.APP,
    env: process.env.NODE_ENV,
    secret: process.env.APP_SECRET,
    sentryToken: process.env.SENTRY_TOKEN,
    sentryID: process.env.SENTRY_ID,
    mongo: {
        uri: process.env.MONGOURI,
        keysUri: process.env.MONGOKEYSURI,
        testURI: process.env.MONGOTESTURI,
        stagingURI: process.env.MONGOSTAGINGURI,
        testKeysURI: process.env.MONGOTESTKEYSURI,
        db: process.env.MONGODB
    },
    exportPathVideo: process.env.EXPORT_PATH_VIDEO,
    exportPathAudio: process.env.EXPORT_PATH_AUDIO,
    exportPathImage: process.env.EXPORT_PATH_IMAGE,
    defaultAudioExtension: process.env.DEFAULT_AUDIO_EXTENSION,
    defaultVideoExtension: process.env.DEFAULT_VIDEO_EXTENSION,
    defaultImageExtension: process.env.DEFAULT_IMAGE_EXTENSION,
};
