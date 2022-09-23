'use strict';
const RedditPost = require('../services/utils/reddit')
const TextToSpeech = require('../services/utils/textToSpeech')
const config = require('../config')
const ImagerUtils = require('../services/utils/imager')
const Imager = ImagerUtils.Imager;
const SaveImage = ImagerUtils.Save;
const FFMPEG = require('../services/utils/ffmpeg')
const exportPathVideo = config.exportPathVideo;
const exportPathImage = config.exportPathImage;
const exportPathAudio = config.exportPathAudio;
const fs = require('fs');
const defaultAudioExtension = config.defaultAudioExtension;
const defaultImageExtension = config.defaultImageExtension;
const Helpers = require('../helpers')
const { defaultVideoExtension } = require('../config')

exports.getContent = async (req, res, next) => {
    let { url, comment_count } = req.body;
    //Add .json if not there
    url = url.substring(url.length - 5, url.length) === '.json' ? url : url.charAt(url.length) === '/' ? url.replace(/.$/, ".json") : url + '.json';
    try{
        await RedditPost.init(url);
    }catch(err){
        console.err("CONNECTING TO REDDIT: " + err);
    }
    let allComments = RedditPost.getComments();
    const DEFAULT_COMMENT_COUNT = allComments.length < 15 ? allComments.length : 15;
    allComments = comment_count && typeof comment_count == 'number' ? allComments.slice(comment_count) : allComments.slice(DEFAULT_COMMENT_COUNT);
    for (const comment of allComments) {
        //Record voice over for comments
        const TTS_SPOKEN = await TextToSpeech.say(comment.body)
        let filenameAudio = exportPathAudio + comment.author + defaultAudioExtension
        if (fs.existsSync(filenameAudio)) filenameAudio = exportPathAudio + comment.author + '_' + Helpers.generateRandomString('5') + defaultAudioExtension
        TextToSpeech.saveToFile(filenameAudio, TTS_SPOKEN)

        //Write comments on screen
        let writtenOnPhoto = await Imager.write(comment.body)
        let filenameImage = comment.author + defaultImageExtension
        if (fs.existsSync(filenameImage)) filenameImage = comment.author + '_' + Helpers.generateRandomString(5) + defaultImageExtension
        await SaveImage(writtenOnPhoto, filenameImage, exportPathImage);

        //Join (written comment on screen) and (voice saying audio)
        let iNamedJoinedFile = comment.author + '_pre' + defaultVideoExtension
        if (fs.existsSync(iNamedJoinedFile)) iNamedJoinedFile = comment.author + '_' + Helpers.generateRandomString(5) + defaultVideoExtension
        FFMPEG.joinImageAndAudio(filenameImage, filenameAudio, iNamedJoinedFile) //needs await
    }
    let videosToJoin = [];
    let commentsVideoPaths = fs.readdirSync(exportPathVideo);
    for (const path of commentsVideoPaths) videosToJoin.push('' + exportPathVideo + path);

    //SET name of file from reddit url. Max of 10 characters as filename
    let videoName = url.match(/([a-zA-Z]+(_[a-zA-Z]+)+)/)[0]
    let finalVideoName = videoName.length > 10 ? videoName.slice(0, 10) : videoName
    FFMPEG.mergeVideos(videosToJoin, finalVideoName)
    console.log("FINAL VIDEO", FFMPEG.getFinalVideo());
}