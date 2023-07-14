const Common = require('../helpers/common');
const CheckPoint = require('../models/check_point_model');

exports.err = async (req, res, next) => {
    Common.logData(null, req);
    try {
        return Common.successResult(res, {});
    } catch (e) {
        return Common.errorResult(res, {}, 'ERR_WORD_CATEGORY_FIND_USER', 200);
    }
};

exports.txtToImg = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const url = 'http://112.169.41.227:7860/sdapi/v1/txt2img';
        const data = {
            'steps': req.body['steps'],
            'prompt': req.body['prompt'],
            'sd_model_checkpoint': req.body['sd_model_checkpoint'],
        };
        const resData = await Common.axiosPost(url, data);
        if (resData.images.length === 0 ) {
            // throw new Error('ERR CREATE CHARACTER');
            return Common.successResult(res, {message: ""}, "캐릭터 생성 실패");
        }

        return Common.successResult(res, {character: resData.images}, "캐릭터 생성 성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.checkPointList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const checkPointList = await CheckPoint.findAll();
        return Common.successResult(res, {check_point: checkPointList}, "체크포인트조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};