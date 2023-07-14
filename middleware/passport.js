const CONFIG = require('../config/config');
const { ExtractJwt } = require('passport-jwt');

const JwtStrategy = require('passport-jwt').Strategy;            // JWT
const LocalStrategy = require('passport-local').Strategy;        // Local
const AppleStrategy = require('passport-apple').Strategy;
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
                    if (user.word_category_name === '초등학교') {
                        user.word_category_display_name = '초등학교';
                        user.word_category_code = 'D';
                        user.word_category_name_2 = '초등학교';
                        user.word_category_code_2 = 'D';
                    }else if (user.word_category_name === '중학교') {
                        user.word_category_display_name = '중학교';
                        user.word_category_code = 'E';
                        user.word_category_name_2 = '중학교';
                        user.word_category_code_2 = 'E';
                    }else if (user.word_category_name === '고등학교') {
                        user.word_category_display_name = '수능';
                        user.word_category_code = 'F';
                        user.word_category_name_2 = '고등학교';
                        user.word_category_code_2 = 'F';
                    }else if (user.word_category_name === '토익') {
                        user.word_category_display_name = '토익';
                        user.word_category_code = 'G';
                        user.word_category_name_2 = '토익';
                        user.word_category_code_2 = 'G';
                    }else if (user.word_category_name === '생활기초') {
                        user.word_category_display_name = '생활기초';
                        user.word_category_code = 'I';
                        user.word_category_name_2 = '초등학교,중학교,생활기초';
                        user.word_category_code_2 = 'D,E,I';
                    }else if (user.word_category_name === '생활고급') {
                        user.word_category_display_name = '생활고급';
                        user.word_category_code = 'H';
                        user.word_category_name_2 = '고등학교,토익,생활고급';
                        user.word_category_code_2 = 'F,G,H';
                    }
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

    passport.use('apple', new AppleStrategy({
        clientID: CONFIG.oauth.apple.clientID,
        teamID: CONFIG.oauth.apple.teamID,
        callbackURL: CONFIG.oauth.apple.redirectURL,
        keyID: CONFIG.oauth.apple.keyID,
        privateKeyLocation: CONFIG.oauth.apple.keyLocation
    }, function(accessToken, refreshToken, idToken, profile, cb) {
        cb(null, accessToken.body.id_token);
    }));

    // passport.serializeUser((user,done)=>{
    //     done(null,user);
    // });
    // passport.deserializeUser((user,done)=>{
    //     done(null,user);
    // });

};
