const User = require('../models/user_model');
const jwt = require('jsonwebtoken');
const Common = require('../helpers/common');
const jwtConfig = require('../config/JWTconfig');

const passport = require('passport');
require('../middleware/passport')(passport);

exports.signNonMember = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const uniqueId = Common.makeId(32);
        const signRoute = req.body['sign_route'];
        const [nonMember, nonMemberErr] = await User.insertOneTemp(uniqueId, signRoute);
        // if (req.body['tutorial'] === null || req.body['tutorial'] === undefined || req.body['tutorial'] === '' || req.body['tutorial'] === true || req.body['tutorial'] === 'true') {
        //     await Cash.addTutorialCash(nonMember['insertId']); // 튜토리얼 보상
        // }
        const loginTime = Common.getDateString(2);
        const accessToken = jwt.sign({payload: {user_idx: nonMember['insertId'], login_time: loginTime},}, jwtConfig.secret, jwtConfig.option);
        const refreshToken = jwt.sign({payload: {},}, jwtConfig.secret, jwtConfig.optionRefreshToken);
        await User.updateUserAgentWhenLogin(nonMember['insertId'], req.headers['user-agent'], accessToken, refreshToken, loginTime);
        return Common.successResult(res, {access_token: accessToken, refresh_token: refreshToken, unique_id: uniqueId});
    } catch (e) {
        console.log(e);
        return Common.errorResult(res, {}, 'ERR', 200);
    }

};

exports.loginNonMember = async (req, res, next) => {
    Common.logData(null, req);
    try {
        passport.authenticate('local', (passportError, user, info) => {
            if (passportError || !user) {
                return Common.errorResult(res, {}, 'ERR_AUTH_PASSPORT', 200);
            }
            req.login(user, {session: false}, async (loginError) => {
                if (loginError) {
                    next(loginError);
                    return;
                }
                const loginTime = Common.getDateString(2);
                const accessToken = jwt.sign({payload: {user_idx: user.user_idx, login_time: loginTime},}, jwtConfig.secret, jwtConfig.option);
                const refreshToken = jwt.sign({payload: {},}, jwtConfig.secret, jwtConfig.optionRefreshToken);
                await User.updateUserAgentWhenLogin(user.user_idx, req.headers['user-agent'], accessToken, refreshToken, loginTime);
                const data = {access_token: accessToken, refresh_token: refreshToken,};
                return Common.successResult(res, data);
            });
        })(req, res);
    }catch (e) {
        console.log(e);
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};
