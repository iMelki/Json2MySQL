/*
//Outers:
const express = require('express');
var createError = require('http-errors');
var path = require('path');
var debug = require('debug')('app');

//Insiders:
const jsonToMySQL = require('./jsonToMySQL.js');
var indexRouter = require('./routes/index');


const app = express();

const port = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const data = jsonToMySQL.startScript();

//Set up MySQL connection:
// currently in the original file

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
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

module.exports = app;
*/
