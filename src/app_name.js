'use strict'
const REDDITOR_MONGO_DB = require('./services/core/db/mongoose')
const REDDITOR = require('./services/core/express')
const config = require('./config')

REDDITOR.init()
//Uncomment to init DB
// REDDITOR_MONGO_DB.connect()
setTimeout(async () => {

if (config.env === 'production') {
}
}, 2000)

module.exports = REDDITOR
