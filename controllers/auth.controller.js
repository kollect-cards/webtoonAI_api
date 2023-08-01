const User = require('../models/user_model');
const jwt = require('jsonwebtoken');
const Common = require('../helpers/common');
const jwtConfig = require('../config/JWTconfig');
const CONFIG = require('../config/config');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CONFIG.oauth.google.clientID);
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

exports.loginGoogle = async (req, res, next) => {
    Common.logData(null, req);
    if (req.body.token === undefined || req.body.token === null || req.body.token === '') {
        return Common.errorResult(res, {}, 'ERR_AUTH_GOOGLE_NO_TOKEN', 200);
    }
    try {
        const idToken = req.body['token'];
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: CONFIG.oauth.google.appClientIDs,  //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        Common.logData(ticket.payload.email, '*********  > ')
        let user = await User.findOne(null, ticket.payload.email);
        console.log(ticket.payload)
        if (user === null) {
            return Common.errorResult(res, {}, 'ERR_AUTH_LOGIN_GOOGLE_NOT_FIND_USER', 200);
        }else if (user.delete_dt != null) {
            if (Common.getNowAndDateDiffToDays(user.delete_dt) < 7){
                return Common.errorResult(res, {}, 'ERR_AUTH_NUMBER_CHECK_SEVEN_DAYS_WITHDRAWAL', 200);
            }
        }else if (user.sns_type !== 'google') {
            return Common.errorResult(res, {}, 'ERR_AUTH_LOGIN_NOT_MATCHING_SNS_TYPE', 200);
        }
        const loginTime = Common.getDateString(2);
        const accessToken = jwt.sign({payload: {user_idx: user.user_idx, login_time: loginTime},}, jwtConfig.secret, jwtConfig.option);
        const refreshToken = jwt.sign({payload: {},}, jwtConfig.secret, jwtConfig.optionRefreshToken);
        await User.updateUserAgentWhenLogin(user.user_idx, req.headers['user-agent'], accessToken, refreshToken, loginTime);
        let data = {user_idx: user.user_idx, accessToken: accessToken, refresh_token: refreshToken,};
        return Common.successResult(res, data);
    } catch (e) {
        console.log(e);
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.signSNS = async (req, res, next) => {
    Common.logData(null, req);
    const snsType = req.params.sns_type;
    if (snsType == undefined || snsType == null || snsType == '') {
        return Common.errorResult(res, {error_message: 'sns_type'}, 'ERR_REQUIRED_VALUES', 200);
    }

    let uniqueId = null;
    let phoneNumber = null;
    let friendCode = null;
    let profileImg = null;
    let nickname = null
    let authIdx = req.body['auth_idx'];
    let signRoute = req.body['sign_route'];
    let deviceUid = req.body['device_uid'];

    // 구글/애플 토큰 정보
    if (req.body.token == undefined || req.body.token == null || req.body.token == '') {
        Common.logData('      : ERR_REQUIRED_VALUES - token (idToken) ')
        return Common.errorResult(res, {error_message: 'token (idToken)'}, 'ERR_REQUIRED_VALUES', 200);
    }

    // 비회원으로 가입한 히스토리 체크
    if (req.body['unique_id'] != null && req.body['unique_id'] != undefined && req.body['unique_id'] != '') {
        uniqueId = req.body['unique_id'];
        if (await User.findOne(null, null, uniqueId) === null) {
            Common.logData(`      : ERR_AUTH_${snsType.toUpperCase()}_NOT_FIND_UNIQUE_USER`)
            return Common.errorResult(res, {}, `ERR_AUTH_${snsType.toUpperCase()}_NOT_FIND_UNIQUE_USER`, 200);
        }
    }

    if (req.body['friend_code'] !== undefined && req.body['friend_code'] !== null && req.body['friend_code'] !== '') {
        friendCode = req.body['friend_code'];
    }

    try {
        const idToken = req.body['token'];
        let email = null;
        let sub = null;
        let locale = 'kr';
        let reSignCheck = false;
        if (snsType === 'google') {
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: CONFIG.oauth.google.appClientIDs,  //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            if (ticket.payload.hasOwnProperty('email') === false) {
                Common.logData('      : ERR_SIGN_SNS_GOOGLE ')
                return Common.errorResult(res, {
                    data: ticket
                }, `ERR_AUTH_SIGN_${snsType.toUpperCase()}`, 200);
            }
            Common.logData(ticket.payload.email, '*********  > ')
            email = ticket.payload.email;
            sub = ticket.payload.sub;
            locale = ticket.payload.locale.replaceAll('ko', 'kr');
            nickname = email.split('@')[0];

        } else if (snsType === 'apple') {
            const ticket = jwt.decode(idToken);
            email = ticket.email;
            if (ticket.hasOwnProperty('email') === false) {
                Common.logData('      : ERR_SIGN_SNS_APPLE ')
                return Common.errorResult(res, {
                    data: ticket
                }, `ERR_AUTH_SIGN_${snsType.toUpperCase()}`, 200);
            }
            sub = ticket.sub;
            // locale = ticket.locale;
            nickname = email.split('@')[0];
        } else if (email == null | email == undefined || email == '') {
            Common.logData('      : ERR_REQUIRED_VALUES - ticket.email !!! ')
            return Common.errorResult(res, {error_message: '- ticket.email !!! '}, 'ERR_REQUIRED_VALUES', 200);
        } else if (sub == null | sub == undefined || sub == '') {
            Common.logData('      : ERR_REQUIRED_VALUES - ticket.sub !!! ')
            return Common.errorResult(res, {error_message: '- ticket.sub !!! '}, 'ERR_REQUIRED_VALUES', 200);
        } else {
            Common.logData('      : ERR_REQUIRED_VALUES - sns_type (google, apple, kakao) ')
            return Common.errorResult(res, {error_message: 'sns_type (google, apple, kakao)'}, 'ERR_REQUIRED_VALUES', 200);
        }

        let user = await User.findOne(null, email);
        if (user !== null && user.delete_dt !== null) {
            if (Common.getNowAndDateDiffToDays(user.delete_dt) < 7) {
                Common.logData('      : ERR_AUTH_NUMBER_CHECK_SEVEN_DAYS_WITHDRAWAL')
                return Common.errorResult(res, {
                    error_message: '탈퇴 후 7일이 지나지 않음',
                }, `ERR_AUTH_NUMBER_CHECK_SEVEN_DAYS_WITHDRAWAL`, 200);
            }
            reSignCheck = true;
        }
        // [1] 구글 X, 비회원 X => 완전 웰컴 신규
        if (user === null && (uniqueId === null || uniqueId === undefined)) {
            Common.logData('      : [1-1] 웰컴 완전 신규 유저로 즉시 가입 ==== ');
            // [1-1] 웰컴 유저로 즉시 가입
            uniqueId = Common.makeId(32);
            const [userSqlResult1, err1] = await User.insertOneTemp(uniqueId, signRoute, deviceUid);
            const [userSqlResult2, err2] = await User.updateTempUserBySNS(snsType, uniqueId, email, sub, locale, req.headers['user-agent'], phoneNumber, friendCode, nickname, profileImg);

            if (friendCode != null) {
                // 추천인 보상 처리
                // let friendInviteCash = await SystemConfig.findValueByConfName('friend_invite_cash_for_ori_user');
                // // 추천인 코드 보상 지급
                // Common.logData(`      :  - 추천인코드캐시지급 [friendCode(ORI): ${friendCode}]`);
                // const oriUser = await User.findOne(null, null, null, friendCode);
                // Common.logData(`      :  - 추천인코드캐시지급 [NEW] user_idx:${userSqlResult1['insertId']}, 'new', ${oriUser['user_idx']}`);
                // await Cash.addFriendCash(userSqlResult1['insertId'], 'new', oriUser['user_idx']);
                // Common.logData(`      :  - 추천인코드캐시지급 [ORI] user_idx:${oriUser['user_idx']}, 'ori', ${userSqlResult1['insertId']}`);
                // await Cash.addFriendCash(oriUser['user_idx'], 'ori', userSqlResult1['insertId']);
                // if (oriUser['push_token'] !== null) {
                //     PushMessage.firebaseMessageByTokens(`${friendInviteCash['conf_value']}캐시 지급완료! 친구가 똑똑보카를 함께 시작했어요!`, `${friendInviteCash['conf_value']}캐시 지급완료! 친구가 똑똑보카를 함께 시작했어요!`, [oriUser['push_token']]);
                //     await UserAlarm.insertOne(oriUser['user_idx'], '일반', `${friendInviteCash['conf_value']}캐시 지급완료! 친구가 똑똑보카를 함께 시작했어요!`, `${friendInviteCash['conf_value']}캐시 지급완료! 친구가 똑똑보카를 함께 시작했어요!`, 1);
                //
                // }
            }
        } else if (user != null && (uniqueId === null || uniqueId === undefined)) {
            if (reSignCheck) {
                // 재가입유저라 캐시 미지급
                uniqueId = Common.makeId(32);
                const [userSqlResult1, err1] = await User.insertOneTemp(uniqueId, signRoute, deviceUid);
                const [userSqlResult2, err2] = await User.updateTempUserBySNS(snsType, uniqueId, email, sub, locale, req.headers['user-agent'], phoneNumber, friendCode, nickname, profileImg);
            }else {
                Common.logData(`      : [ERR] 이미 해당 이메일로 회원가입한 유저가 있음 ==== user_idx: ${user.user_idx}`);
                return Common.errorResult(res, {
                    error_message: '이미 해당 이메일로 회원가입한 유저가 있음.',
                    user: {
                        sns_type: user.sns_type
                    }
                }, `ERR_AUTH_SIGN_ALREADY_USER_${snsType.toUpperCase()}`, 200);
            }
        }
        user = await User.findOne(null, email);

        if (user === null) {
            Common.logData(`      : [ERR] ERR_AUTH_SIGN_${snsType.toUpperCase()} | user === null`);
            return Common.errorResult(res, {}, `ERR_AUTH_SIGN_${snsType.toUpperCase()}`, 200);
        }

        const loginTime = Common.getDateString(2);
        const accessToken = jwt.sign({payload: {user_idx: user.user_idx, login_time: loginTime},}, jwtConfig.secret, jwtConfig.option);
        const refreshToken = jwt.sign({payload: {},}, jwtConfig.secret, jwtConfig.optionRefreshToken);
        Common.logData(`      :  - CALL [updateUserAgentWhenLogin] ${user.user_idx}, ${req.headers['user-agent']}, ${accessToken}, ${refreshToken}`);
        await User.updateUserAgentWhenLogin(user.user_idx, req.headers['user-agent'], accessToken, refreshToken, loginTime);
        let data = {user_idx: user.user_idx, accessToken: accessToken, refresh_token: refreshToken,};
        return Common.successResult(res, data);
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};