'use strict';
const RedditPost = require('../services/utils/reddit')
const TextToSpeech = require('../services/utils/textToSpeech')
const config = require('../config')
const ImagerUtils = require('../services/utils/imager')
const { defaultVideoExtension, defaultCommentCount, defaultFileNameLength, defaultContentWidth, defaultContentHeight, defaultContentColor } = require('../config')
const SaveImage = ImagerUtils.Save;
const FFMPEG = require('../services/utils/ffmpeg')
const exportPathVideo = config.exportPathVideo;
const exportPathImage = config.exportPathImage;
const exportPathAudio = config.exportPathAudio;
const fs = require('fs');
const defaultAudioExtension = config.defaultAudioExtension;
const defaultImageExtension = config.defaultImageExtension;
const Helpers = require('../helpers');
const CronManager = require('../services/core/cron/manager');
const { generateCronExpression, CRON_TIME_PERIODS } = require('../helpers/cronjob');

/**
 * Creates Video content out of a reddit URL
 * @protected
 * @function
 * @memberof RESTAPIController
 * @param {{...Object,body: {url: URL, comment_count: Number}}} req HTTP request
 * @param {Function} res HTTP response function. (What to do when you get a response)
 * @param {*} next callback function where applicable
 */
exports.getContent = async (req, res, next) => {
    try {

        let { url, comment_count } = req.body;

        //Add .json if not there
        url = url.substring(url.length - 5, url.length) === '.json' ? url : url.charAt(url.length) === '/' ? url.replace(/.$/, ".json") : url + '.json';

        //TODO: If there's no signal, it crashes saying allcomments is undefined. I need to put a try catch inside the function handle nework issues 
        let redditConnection = await RedditPost.init(url);

        //If successfully got reddit post (No network issue)
        if (redditConnection.status) {

            let allComments = RedditPost.getComments();
            const DEFAULT_COMMENT_COUNT = allComments.length < defaultCommentCount ? allComments.length : defaultCommentCount;
            allComments = comment_count && typeof comment_count == 'number' ? allComments.slice(0, comment_count) : allComments.slice(0, DEFAULT_COMMENT_COUNT);

            for (const comment of allComments) {

                //Record voice over for comments
                const TTS_SPOKEN = await TextToSpeech.say(comment.body)
                let filenameAudio = exportPathAudio + comment.author + defaultAudioExtension
                if (fs.existsSync(filenameAudio)) filenameAudio = exportPathAudio + comment.author + '_' + Helpers.generateRandomString('5') + defaultAudioExtension
                TextToSpeech.saveToFile(filenameAudio, TTS_SPOKEN)

                //Write comments on screen
                const Imager = ImagerUtils.Imager(defaultContentWidth, defaultContentHeight, defaultContentColor);
                let writtenOnPhoto = await Imager.write(comment.body)
                let filenameImage = exportPathImage + comment.author + defaultImageExtension
                if (fs.existsSync(exportPathImage + filenameImage)) filenameImage = comment.author + '_' + Helpers.generateRandomString(5) + defaultImageExtension
                let x = await SaveImage(writtenOnPhoto, filenameImage, exportPathImage);

                //Join (written comment on screen) and (voice saying audio)
                let iNamedJoinedFile = comment.author + '_pre' + defaultVideoExtension
                if (fs.existsSync(iNamedJoinedFile)) iNamedJoinedFile = comment.author + '_' + Helpers.generateRandomString(5) + defaultVideoExtension
                FFMPEG.joinImageAndAudio(filenameImage, filenameAudio, iNamedJoinedFile) //TODO:needs await
            }
            //While FFMPEG running processes > 0, wait
            if (FFMPEG.isJoiningImageAndAudio()) {
                //Schedule merge video every two minutes
                //WARNING: IF FFMPEG TAKES LONGER THAN 5 MINUTES TO MERGE VIDEO, It'll start all over.
                //St

                //TASK IS TO SCHEDULE MERGE VIDEO EVERY 5 MINUTES minutes
                //IF WE SCHEDULE MERGE VIDEO NOW, IT'LL START NOW. WE WANT TO WAIT 3 MINUTES BEFORE WE SCHEDULE IT.

                //CREATE QUEUE OF TASKS, PUT MERGE VIDEO IN IT
                //SET CRON_JOB DEFAULT, EVERY 3 Minutes, Run run queue Of Tasks
                const QueueManager = require('../services/core/queue/manager')
                if (QueueManager.init()) {
                    //Defines a task to merge video and has scheduled to try running every 3 minutes  
                    //When you add a task to queue and it runs, after it finishes, what do you want to do?
                    await QueueManager.addJobToQueue('MULTIMEDIA', {task: 'merge-video', url: 'https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json',every: 5, when:CRON_TIME_PERIODS['MINUTE']})
                    CronManager.scheduleTaskForCron('MULTIMEDIA',generateCronExpression(3,CRON_TIME_PERIODS['MINUTE']),await QueueManager.runQueue('MULTIMEDIA',{task: 'merge-video', url: 'https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json',every: 5, when:CRON_TIME_PERIODS['MINUTE']}))
                
                }

            }
        } else {
            //TODO: LOG ERROR: NETWORK ISSUE, COULDN'T GET REDDIT POST
            console.log('ERROR, NETWORK ISSUE, COULDN\'T GET REDDIT POST')
        }
    } catch (err) {
        console.log("MANDEM SEE THIS!!");
        console.log(err);
    }

    /**
     * Time periods our cron understands. E.g Second, Minute, Day, Month, Year 
     * @typedef CRON_TIME_PERIODS
     * @enum {Number}
     */
    /**
     * Schedule a task that merges videos if system has finished creating the prerequisite videos. 
     * If the system hasn't finished creating the prerequisite videos, it'll try again every x t until FFMPEG has merged videos
     * @protected
     * @function
     * @memberof RESTAPIController
     * @param {URL} url Reddit content url we're working with
     * @param {Number} x every x, {@link CRON_TIME_PERIODS} where x is a number.
     * @param {CRON_TIME_PERIODS} t time period
     * @returns
     */
    //TODO:JSDOC RETURNS HERE.
    function scheduleMergeVideos(url, x, t) {
        return CronManager.scheduleTaskForCron('MULTIMEDIA', {
            cronExpression: Helpers.CronJob.generateCronExpression(x, t),
            task: async () => {
                console.log('Richie You see,..... it never gebkgv shotk sfkhh');
                if (!FFMPEG.isJoiningImageAndAudio() && FFMPEG.isReadyForMerge() && !FFMPEG.hasMergedVideos()) {
                    console.log('====================================');
                    console.log("RUNNING MERGE FUNC EVERY x t");
                    console.log('====================================');
                    //Merge video and disable MergeVideo from MultimediaCronJob's schedule 
                    let videosToJoin = [];
                    let commentsVideoPaths = fs.readdirSync(exportPathVideo);
                    for (const path of commentsVideoPaths)
                        videosToJoin.push('' + exportPathVideo + path);

                    //SET name of file from reddit url. Max of 10 characters as filename
                    let videoName = url.match(/([a-zA-Z]+(_[a-zA-Z]+)+)/)[0];
                    let finalVideoName = videoName.length > defaultFileNameLength ? videoName.slice(0, defaultFileNameLength) : videoName;
                    if (!FFMPEG.isWorking()) FFMPEG.mergeVideos(videosToJoin, finalVideoName); //TODO: NEEDS PROMISE
                    console.log("FINAL VIDEO", FFMPEG.getFinalVideo());

                    //
                } else if (FFMPEG.hasMergedVideos()) {

                }
            }
        });
    }
    /**
     * Schedule a task that checks if our server has finished merging videos together.
     * If the system hasn't finished creating the prerequisite videos, it'll try again every x t until FFMPEG has merged videos
     * @protected
     * @function
     * @memberof RESTAPIController
     * @param {Number} x every x, {@link CRON_TIME_PERIODS} where x is a number.
     * @param {CRON_TIME_PERIODS} t time period
     * @returns
     */
    //TODO:JSDOC RETURNS HERE.
    function scheduleCheckServerIfVideoMerged(x, t) {
        return CronManager.scheduleTask('MULTIMEDIA', {
            cronExpression: Helpers.CronJob.generateCronExpression(x, t),
            task: async () => {
                return FFMPEG.hasMergedVideos();
            }
        });
    }
    //TODO:HOW TO STOP MERGE VIDEOS THAT TRYS AGAIN EVERY 5 minutes
}