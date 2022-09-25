'use strict'

const config = require('../../../config')
const mongoose = require('mongoose')
const Throbber = require('../../../helpers/throbber')
const mongoThrobber = Throbber.init()

mongoose.Promise = require('bluebird')

mongoose.connection.on('connected', () => {
  mongoThrobber.succeed(`REDDITOR-DB Ready!`)
})

mongoose.connection.on('disconnected', (err) => {
  mongoThrobber.warn(`REDDITOR-DB disconnect from MongoDB via Mongoose because of ${err}`)
})

mongoose.connection.on('error', (err) => {
  mongoThrobber.fail(`Could not connect to REDDITOR-DB because of ${err}`)
  process.exit(-1)
})

// if (config.env === 'dev') {
//  mongoose.set('debug', true)
// }

/**
 * @typedef MongooseConnection
 * @external
 * @see {@link https://github.com/Automattic/mongoose/blob/45e9ed43b5a22913f229bccd1b38f2bd42688be9/types/connection.d.ts}
 */
/**
 * Connects to MongoDb
 * @protected
 * @function
 * @memberof Mongoose
 * @returns {Promise<MongooseConnection> | Promise<Object>} Mongoose connection if successful and error object otherwise
 */
exports.connect = () => {
  mongoThrobber.init()
  var mongoURI = config.env === 'production' || config.env === 'production-sandbox' ? config.mongo.uri : config.env === 'staging' ? config.mongo.stagingURI : config.mongo.testURI
  return new Promise((resolve, reject) => {
    mongoose.connect(mongoURI, {
      keepAlive: 1,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })
      .then(v => {
        resolve(mongoose.connection)
      })
      .catch(err => reject(err))
  });
}
