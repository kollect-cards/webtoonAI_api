const CONFIG = require('../config/config');
const { ExtractJwt } = require('passport-jwt');

const JwtStrategy = require('passport-jwt').Strategy;            // JWT
const LocalStrategy = require('passport-local').Strategy;        // Local
const jwtconfig = require('../config/JWTconfig');

const Common = require("../helpers/common");
const Sentry = require("@sentry/node");

module.exports = function (passport) {
    passport.use(
        'jwt',
        new JwtStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtconfig.secret
        }, async function (jwt_payload, done) {;
            try {
                // TODO
            }catch (e) {
                Sentry.captureException(e);
                return done(e, false);
            }
        })
    );

    passport.use(
        'jwt_refresh',
        new JwtStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtconfig.secret
        }, async function (jwt_payload, done) {
            return done(null, {});
        })
    );
};
