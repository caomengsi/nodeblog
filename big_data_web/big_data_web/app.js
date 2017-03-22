var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');



var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var partials = require('express-partials');

// view engine setup
app.set('views', path.join(__dirname, 'views'));

   app.set('view engine', 'ejs');
   // Include partials middleware into the server
   app.use(partials());



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	key: 'session',
	secret: 'keyboard cat',
	cookie: {
		maxAge: 1000 * 60 * 60 * 24
	}, //1day
	store: new MongoStore({
		db: 'datas',
		mongooseConnection: mongoose.connection
	}),
	resave: true,
	saveUninitialized: true,

}));
app.use(flash());
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
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
app.listen(4000);
module.exports = app;
//连接数据库
mongoose.connect('mongodb://localhost:27017/datas');
mongoose.connection.on('error', console.error.bind(console, '连接数据库失败'));