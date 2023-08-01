const CONFIG = require('../config/config');
const { ExtractJwt } = require('passport-jwt');

const JwtStrategy = require('passport-jwt').Strategy;            // JWT
const LocalStrategy = require('passport-local').Strategy;        // Local
const jwtconfig = require('../config/JWTconfig');

const User = require('../models/user_model');
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
                let [user, err] = await User.findOneFromPassport(jwt_payload.payload.user_idx);

                if (user === null || user === undefined) {
                    Common.logData(`USER_IDX [${jwt_payload.payload.user_idx}]: 조회되는 유저가 없는데요? `)
                    return done(null, false);
                }
                if (user.delete_dt != null) {
                    Common.logData(`USER_IDX [${jwt_payload.payload.user_idx}]: 이미 탈퇴한 회원`)
                    return done(err, false);
                }
                if (jwt_payload.payload.hasOwnProperty('login_time')) {
                    if (jwt_payload.payload.login_time !== Common.getDateString(2, user.last_login_dt)) {
                        Common.logData(`USER_IDX [${jwt_payload.payload.user_idx}]: 로그인 정보가 유효하지 않음 (다른곳에서 로그인 함)`)
                        return done(err, false);
                    }
                }
                if (user.refresh_token == null) {
                    Common.logData(`USER_IDX [${jwt_payload.payload.user_idx}]: REFRESH TOKEN NULL `)
                    return done(err, false);
                }
                if (user) {
                    Common.logData(`USER_IDX [${jwt_payload.payload.user_idx}] | email: ${user.email}`);
                    return done(null, user);
                } else {
                    Common.logData(`USER_IDX [${jwt_payload.payload.user_idx}]: 조회되는 유저가 없는데요? `)
                    return done(null, false);
                }
            }catch (e) {
                Common.logData(`USER_IDX [${jwt_payload.payload.user_idx}]: 유저조회중 에러발생 `)
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

    // Local Strategy // 로컬 비회원 로그인 (비회원으로 이용)
    passport.use(
        'local',
        new LocalStrategy({
            usernameField: 'unique_id',
            passwordField: 'password' // client secret key
        }, async (uniqueId, password, done) => {
            console.log('passport use local')
            if (password != CONFIG.secret) {
                return done('PASSPORT_SECRET_NOT_MATCH', false);
            }
            let user = await User.findOne(null, null, uniqueId);
            if (user === null) {
                return done('PASSPORT_NOT_FIND_USER', false);
            }
            // if (err){
            //     return done(err, false);
            // }
            // if (user.hasOwnProperty('email') && user.email != null) {
            //     return done('PASSPORT_ALREADY_SIGN_IN', false);
            // }
            return done(null, user);
        })
    );
};
