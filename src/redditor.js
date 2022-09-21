'use strict'
const REDDITOR_MONGO_DB = require('./services/core/db/mongoose')
const REDDITOR = require('./services/core/express')
const config = require('./config')
const RedditPost = require('./services/utils/reddit')
const TextToSpeech = require('./services/utils/textToSpeech')
const ImagerUtils = require('./services/utils/imager')
const Imager = ImagerUtils.Imager;
const SaveImage = ImagerUtils.Save;
const FFMPEG = require('./services/utils/ffmpeg')
const exportPathVideo = config.exportPathVideo;
const exportPathImage = config.exportPathImage;
const exportPathAudio = config.exportPathAudio;
const fs = require('fs');
const defaultAudioExtension = config.defaultAudioExtension;
const defaultImageExtension = config.defaultImageExtension;
const Helpers = require('./helpers')
const { defaultVideoExtension } = require('./config')
REDDITOR.init()
setTimeout(async () => {
    await RedditPost.init('https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json');
    //await RedditPost.init('https://www.reddit.com/r/AskReddit/comments/hvbvpz/what_life_changing_item_can_you_buy_for_less_than.json');
    let allComments = RedditPost.getComments();
    for (const comment of allComments) {
        //Record voice over for comments
        const TTS_SPOKEN = await TextToSpeech.say(comment.body)
        let filenameAudio = exportPathAudio + comment.author + defaultAudioExtension
        if (fs.existsSync(filenameAudio)) filenameAudio = exportPathAudio + comment.author + '_' + Helpers.generateRandomString('5') + defaultAudioExtension
        TextToSpeech.saveToFile(filenameAudio, TTS_SPOKEN)
        // console.log('Just recorded the voiceover for ', filenameAudio)

        //Write comments on screen
        let writtenOnPhoto = await Imager.write(comment.body)
        let filenameImage = comment.author + defaultImageExtension
        if (fs.existsSync(filenameImage)) filenameImage = comment.author + '_' + Helpers.generateRandomString(5) + defaultImageExtension
        await SaveImage(writtenOnPhoto, filenameImage, exportPathImage);

        //Join (written comment on screen) and (voice saying audio)
        let iNamedJoinedFile = comment.author + '_pre' + defaultVideoExtension
        if (fs.existsSync(iNamedJoinedFile)) iNamedJoinedFile = comment.author + '_' + Helpers.generateRandomString(5) + defaultVideoExtension
        FFMPEG.joinImageAndAudio(filenameImage, filenameAudio, iNamedJoinedFile) //TODO: MAYBE REMOVE await
        // console.log('Successfully Made comment video', iNamedJoinedFile)
    }
    let videosToJoin = [];
    let commentsVideoPaths = fs.readdirSync(exportPathVideo);
    for (const path of commentsVideoPaths) videosToJoin.push('' + exportPathVideo + path);
    FFMPEG.mergeVideos(videosToJoin, 'what-life-changing-item-can-you-buy-for-less-than')
    console.log("merge video logged", FFMPEG.getFinalVideo());
}, 2000)
// REDDITOR_MONGO_DB.connect()
setTimeout(async () => {
    if (config.env === 'production') {
    }
}, 2000)

module.exports = REDDITOR
