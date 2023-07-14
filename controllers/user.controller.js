const Common = require('../helpers/common');
exports.find = async (req, res, next) => {
    Common.logData(null, req);
    try {
        return Common.successResult(res, req.user);
    } catch (e) {
        return Common.errorResult(res, {}, 'ERR_USER', 200);
    }
};
