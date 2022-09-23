'use strict'
const express = require('express')
const router = express.Router()
const redditorController = require('../../controllers/redditor.controller')

router.use('/create', redditorController.getContent)

module.exports = router