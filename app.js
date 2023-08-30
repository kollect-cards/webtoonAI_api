const express = require('express');
const logger = require('morgan');
const pe = require('parse-error');
const api = require('./routes/api');
const cors = require("cors");
const passport = require('passport');
const passportConfig = require('./middleware/passport');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('short', {
    // skip: function (req, res) { return res.statusCode === 200 }
}));

app.use(passport.initialize());
passportConfig(passport);

app.use('/', api);

app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res, next) {
    console.log('DEBUG ======= ');
    console.log(err)
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'dev' ? err : {};
    res.status(err.status || 500);
    res.json({
        code: err.status || 500,
        message: err.message,
        data: {},
    });
});

module.exports = app;
process.on('unhandledRejection', err => {
    console.error('Uncaught Error', pe(err));
});

