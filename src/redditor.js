'use strict'
const REDDITOR_MONGO_DB = require('./services/core/db/mongoose')
const REDDITOR = require('./services/core/express')
const REDDITOR_CRON = require('./services/core/cron')
const config = require('./config')
const control = require('./controllers/redditor.controller')

REDDITOR.init()
REDDITOR_CRON.init()
setTimeout(async () => {
    // control.getContent({body:{url:'https://www.reddit.com/r/help/comments/uctfcz/why_do_some_reddit_post_show_hundreds_of_comments.json', 'comment_count': 5}}, {}, {} )
    control.getContent({body:{url:'https://www.reddit.com/r/AskReddit/comments/hvbvpz/what_life_changing_item_can_you_buy_for_less_than.json', 'comment_count': 5}}, {}, {} )
}, 2000)
// REDDITOR_MONGO_DB.connect()
setTimeout(async () => {
    if (config.env === 'production') {
    }
}, 2000)

module.exports = REDDITOR

//TODO: Sentry Errors logging together with console logging would be nice unno.