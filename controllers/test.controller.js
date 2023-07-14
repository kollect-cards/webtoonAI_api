const Common = require('../helpers/common');
exports.err = async (req, res, next) => {
    Common.logData(null, req);
    try {
        return Common.successResult(res, {});
    } catch (e) {
        return Common.errorResult(res, {}, 'ERR_WORD_CATEGORY_FIND_USER', 200);
    }
};
