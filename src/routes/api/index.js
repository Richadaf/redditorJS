'use strict'
const express = require('express')
const router = express.Router()
const redditRoute = require('./reddit.route')

router.use('/r', redditRoute)
module.exports = router
