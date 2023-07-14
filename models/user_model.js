const pool = require("../services/mysql.service");
const Common = require("../helpers/common");

const User = {
    findOneFromPassport:async function (userIdx = null) {
        let where = [];
        let whereVal = [];
        if (userIdx != null) {
            where.push('user_idx');
            whereVal.push(userIdx);
        }
        let sqlQuery = where.length == 0 ? 'SELECT * FROM TB_USER' : 'SELECT * FROM TB_USER WHERE 1 = 1 ';
        for (let i = 0; i < where.length; i++) {
            sqlQuery += ' AND ' + where[i] + ' = ? ';
        }
        sqlQuery += ' ORDER BY user_idx DESC ';
        const [user, userRow] = await pool.query(sqlQuery, whereVal);
        return [user.length > 0 ? user[0] : null, userRow];
    },
    findOne: async function (userIdx = null,
                             email = null,
                             uniqueId = null,
                             referralCd = null,
                             nickname = null,
                             refreshToken = null,
                             deviceUid = null,
                             ) {
        let where = [];
        let whereVal = [];
        if (userIdx != null) {
            where.push('user_idx');
            whereVal.push(userIdx);
        }
        if (email != null) {
            where.push('email');
            whereVal.push(email);
        }
        if (uniqueId != null) {
            where.push('unique_id');
            whereVal.push(uniqueId);
        }
        if (referralCd != null) {
            where.push('referral_cd');
            whereVal.push(referralCd);
        }
        if (nickname != null) {
            where.push('nickname');
            whereVal.push(nickname);
        }
        if (refreshToken != null) {
            where.push('refresh_token');
            whereVal.push(refreshToken);
        }
        if (deviceUid != null) {
            where.push('device_uid');
            whereVal.push(deviceUid);
        }

        let sqlQuery = where.length == 0 ? 'SELECT * FROM TB_USER' : 'SELECT * FROM TB_USER WHERE 1 = 1 ';
        for (let i = 0; i < where.length; i++) {
            sqlQuery += ' AND ' + where[i] + ' = ? ';
        }
        sqlQuery += ' ORDER BY user_idx DESC ';
        const [user, userRow] = await pool.query(sqlQuery, whereVal);
        return user.length > 0 ? user[0] : null;
    },

    insertOneTemp: async function (uniqueId, signRoute, deviceUid) {
        const sqlQuery = 'INSERT INTO TB_USER (unique_id, referral_cd, language, last_login_dt, insert_dt, sign_route, device_uid) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const result = await pool.query(sqlQuery, [uniqueId, Common.makeId(6), 'kr', new Date(), new Date(), signRoute, deviceUid]);
        return result;
    },
    updateUserAgentWhenLogin: async function (userIdx, agent, accessToken, refreshToken, datetime) {
        const sqlQuery = 'UPDATE TB_USER SET agent = ?, last_login_dt = ? , last_login_token = ?, refresh_token = ? WHERE user_idx = ?';
        const result = await pool.query(sqlQuery, [agent, datetime, accessToken, refreshToken, userIdx,]);
        Common.errorCheck(result[1], `User.updateUserAgentWhenLogin(${userIdx}, ${agent}, ${accessToken}, ${refreshToken})`)
        return result;
    },
}

module.exports = User
