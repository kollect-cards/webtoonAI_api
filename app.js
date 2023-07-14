const express = require('express');
const logger = require('morgan');
const pe = require('parse-error');
const api = require('./routes/api');
const adminApi = require('./routes/adminApi');
// const CONFIG = require('./config/config');
const cors = require("cors");
const passport = require('passport');
const passportConfig = require('./middleware/passport');
// const Sentry = require("@sentry/node");
// const firebaseAdmin = require("firebase-admin");
const app = express();

// 로그추적 사용할때 활성화
// Sentry.init({
//     dsn: CONFIG.sentry_dns,
//     tracesSampleRate: 0.2,
//     integrations: [
//         // enable HTTP calls tracing
//         new Sentry.Integrations.Http({ tracing: true }),
//     ],
//     enabled: process.env.APP === 'prod' || process.env.APP === 'prod-auto' || process.env.APP === 'dev',
// });
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

// 파이어베이스 푸시 설정할때 활성화
// firebaseAdmin.initializeApp({
//     credential: firebaseAdmin.credential.cert(CONFIG.firebase.service_account_key),
// });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('short', {
    // skip: function (req, res) { return res.statusCode === 200 }
}));

app.use(passport.initialize());
passportConfig(passport);

app.use('/', api);
app.use('/admin/', adminApi);

// 로그 추적시 활성화
// app.use(Sentry.Handlers.errorHandler());
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

