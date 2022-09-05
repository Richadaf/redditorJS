'use strict'
const REDDITOR_MONGO_DB = require('./services/core/db/mongoose')
const REDDITOR = require('./services/core/express')
const config = require('./config')
const RedditPost = require('./services/utils/reddit')

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
    // console.log("       Highest Comments             ");
    // console.log(RedditPost.getHighestComment());
    // console.log('====================================');

} , 2000)
// REDDITOR_MONGO_DB.connect()

setTimeout(async () => {

if (config.env === 'production') {
}
}, 2000)

module.exports = REDDITOR
