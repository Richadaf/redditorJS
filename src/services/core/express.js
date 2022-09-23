'use strict'

const config = require('../../config')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const errorHandler = require('../../middlewares/error-handler')
const apiRouter = require('../../routes/api')
const cookieParser = require('cookie-parser');
const http = require('http');
const SentryIO = require('../../services/utils/sentry')
const Throbber = require('../../helpers/throbber');
const Sentry = new SentryIO()
const app = express()

const allowedDevOrigins = [
	'http://localhost:2000',
	'http://localhost:2001',
	'http://localhost:2002',
	'http://localhost:8888',
	'https://dev.redditor.com',
	'https://dev-api.redditor.com',
	'https://demo-dev.redditor.com',
	'https://dev-dashboard.redditor.com',
	'https://dev-status.redditor.com'
];
const allowedStagingOrigins = [
	'https://staging.redditor.com',
	'https://demo-staging.redditor.com',
	'https://staging-dashboard.redditor.com',
	'https://staging-status.redditor.com',
	'https://staging-api.redditor.com',
	'http://localhost:2000',
	'http://localhost:2001',
	'http://localhost:2002',
	'http://localhost:9999'
];
const allowedProdOrigins = [
	'https://www.redditor.com',
	'https://redditor.com',
	'https://demo.redditor.com',
	'https://app.redditor.com',
	'https://dash.redditor.com',
	'https://status.redditor.com',
	'https://dashboard.redditor.com',
	'http://localhost:2000',
	'http://localhost:2001',
	'http://localhost:2002',
	'http://localhost:8888'
];


app.use(morgan('dev'))
app.use(Sentry.Handlers.requestHandler());
app.use(express.static('public'))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());

if (config.env === 'dev' || config.env === 'sandbox') {
	app.use(function (req, res, next) {
		var origin = req.headers.origin;
		if (allowedDevOrigins.indexOf(origin) > -1) {
			res.setHeader('Access-Control-Allow-Origin', origin);
		}
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
		res.setHeader('Access-Control-Allow-Credentials', true);
		next();
	});
} else if (config.env === 'staging') {
	app.use(function (req, res, next) {
		var origin = req.headers.origin;
		if (allowedStagingOrigins.indexOf(origin) > -1) {
			res.setHeader('Access-Control-Allow-Origin', origin);
		}
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
		res.setHeader('Access-Control-Allow-Credentials', true);
		next();
	});
} else if (config.env === 'production') {
	app.use(function (req, res, next) {
		var origin = req.headers.origin;
		// if (allowedProdOrigins.indexOf(origin) > -1) {
		// }
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
		res.setHeader('Access-Control-Allow-Credentials', true);
		next();
	});
}
app.use('/v1', apiRouter)
app.use('/sandbox/v1', apiRouter)
app.use(function onError(err, req, res, next) {
	res.statusCode = 500;
	res.end(res.sentry + '\n');
});
// app.use(errorHandler.handleNotFound)
// app.use(errorHandler.handleError)
const server = http.createServer(app)
exports.init = async () => {
	server.listen(config.port, async (err) => {
		if (err) {
			Throbber.fail(`Error : ${err}`)
			process.exit(-1)
		}
		Throbber.succeed(`${config.app.toUpperCase()} Ready!`)
	})
}
exports.app = app
exports.server = server
