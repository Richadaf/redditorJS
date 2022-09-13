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
REDDITOR.init()
//This isn't the right way to init. It's for testing purposes. We really need to setup rest API or at least take of the hard codded url.
// console.log(LIFE_CHANGING_ITEMS_POST.getPost());
setTimeout(async () => {
    // await RedditPost.init('https://www.reddit.com/r/AskReddit/comments/hvbvpz/what_life_changing_item_can_you_buy_for_less_than.json');
    // console.log('====================================');
    // console.log("                 POST               ");
    // console.log(RedditPost.getPost());
    // console.log('====================================');
    // console.log('                                    ');
    // console.log('                                    ');
    // console.log('====================================');
    // console.log('====================================');
    // console.log("               Comments             ");
    // console.log(RedditPost.getComments());
    // console.log('====================================');
    // console.log('                                    ');
    // console.log('                                    ');
    // console.log('====================================');
    // let highestComment = RedditPost.getHighestComment()
    // const TTS_SPOKEN = await TextToSpeech.say(highestComment.body)
    // TextToSpeech.saveToFile('./output/' + highestComment.author + '.mp3', TTS_SPOKEN)
    // let writtenOnPhoto = await Imager.write(highestComment.body)
    // console.log('====================================');
    // console.log("THIS", highestComment.body);
    // console.log('====================================');
    // writtenOnPhoto.save(highestComment.author, './output/images/');
    // await SaveImage(writtenOnPhoto, highestComment.author, './output/images/');
    // FFMPEG.joinImageAndAudio('./output/images/duckmama89.png', './output/audio/duckmama89.mp3', 'duckmama89')

    let videosToJoin = [
        './output/videos/duckmama89.mkv',
        './output/videos/duckmama90.mkv',
        './output/videos/duckmama91.mkv',
        './output/videos/duckmama92.mkv',
        './output/videos/duckmama93.mkv',
    ]
    FFMPEG.mergeVideos(videosToJoin, 'what-life-changing-item-can-you-buy-for-less-than')
    // console.log("merge video logged",FFMPEG.getMergedVideo());
}, 2000)
// REDDITOR_MONGO_DB.connect()
setTimeout(async () => {

    if (config.env === 'production') {
    }
}, 2000)

module.exports = REDDITOR
