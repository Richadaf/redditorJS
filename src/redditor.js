'use strict'
const REDDITOR_MONGO_DB = require('./services/core/db/mongoose')
const REDDITOR = require('./services/core/express')
const REDDITOR_CRON = require('./services/core/cron/manager')
const REDDITOR_QUEUE = require('./services/core/queue/manager')
const config = require('./config')
const control = require('./controllers/redditor.controller')
const { CRON_TIME_PERIODS } = require('./helpers').CronJob
REDDITOR.init()
REDDITOR_CRON.init()
REDDITOR_QUEUE.init()
// control.getContent
try {
    if (REDDITOR_QUEUE.init()) {
        //Defines a task to merge video and has scheduled to try running every 3 minutes  
        //When you add a task to queue and it runs, after it finishes, what do you want to do?
        async function test(){
            
            await REDDITOR_QUEUE.addJobToQueue('MULTIMEDIA', {task: 'merge-video', url: 'https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json',every: 5, when:CRON_TIME_PERIODS['MINUTE']})
            await REDDITOR_QUEUE.runQueue('MULTIMEDIA',{task: 'merge-video', url: 'https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json',every: 5, when:CRON_TIME_PERIODS['MINUTE']})
        }
        test()
        
        // REDDITOR_QUEUE.runQueue('MULTIMEDIA',{task: 'merge-video', url: 'https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json'})
            // function temp() {
            //     const MmCron = require('node-cron');

            //     let done = MmCron.schedule("*/1 * * * * *", () => {
            //         console.log("SE IY OOWKFN");
            //     })

            //     done.start();
            // }
            // REDDITOR_QUEUE.addTaskToQueue('MULTIMEDIA', temp())
            // REDDITOR_QUEUE.processQueue('MULTIMEDIA')
        // REDDITOR_QUEUE.addTaskToQueue('MULTIMEDIA', agent.runMergeVideoTask(url, 5, CRON_TIME_PERIODS['MINUTE']))
        // REDDITOR_QUEUE.addTaskToQueue('MULTIMEDIA', agent.runCheckIfVideoMerged(url, 3, CRON_TIME_PERIODS['MINUTE']))
        setTimeout(async () => {
            // control.getContent({body:{url:'https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json', 'comment_count': 5}}, {}, {} )
            // control.getContent({body:{url:'https://www.reddit.com/r/AskReddit/comments/hvbvpz/what_life_changing_item_can_you_buy_for_less_than.json', 'comment_count': 5}}, {}, {} )
        }, 2000)
        // REDDITOR_MONGO_DB.connect()
        setTimeout(async () => {
            if (config.env === 'production') {
            }
        }, 2000)

    function scheduleMergeVideos(url, x, t) {
        return 
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
        
    }

}
}catch (err) {
    console.log('====================================');
    console.log(err);
    console.log('====================================');
}

//TODO: Sentry Errors logging together with console logging would be nice unno.
module.exports = REDDITOR
