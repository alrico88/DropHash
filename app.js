const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ConfigHelper = require('nodejs-config-helper').ConfigHelper;

const server_port = ConfigHelper.getConfigParameter('PORT', 5000);

const index = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended: true,
		parameterLimit: 1000000,
		limit: '50mb',
	}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

// Listen to secure connections
const server = app.listen(server_port, function() {
	console.info('dropHash listening on ' + server_port + ' port');
});

// Define process exits
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
	console.info('Received kill signal, shutting down gracefully');
	server.close(() => {
		console.info('Closed out remaining connections');
		process.exit(0);
	});
	setTimeout(() => {
		console.error('Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 10000);
}

module.exports = app;
