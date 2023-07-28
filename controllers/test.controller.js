const Common = require('../helpers/common');
const CheckPoint = require('../models/check_point_model');
const Gender = require('../models/gender_model');
const HairLength = require('../models/hair_length_model');
const HairColor = require('../models/hair_color_model');
const HairStyle = require('../models/hair_style_model');
const CutsecnPose = require('../models/cutsecn_pose_model');
const CutsecnBack = require('../models/cutsecn_back_model');
const Costume = require('../models/costume_model');
const Queue = require('../models/queue_model');
const FileReader =  require('filereader');

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
            // 'steps': req.body['steps'],
            'steps': 20,
            'prompt': '((best quality, high_resolution, distinct_image)) ' + req.body['prompt'],
            'negative_prompt': 'worst quality, low quality, watermark, text, error, blurry, jpeg artifacts, worst quality, low quality, normal quality, jpeg artifacts, signature, username, artist name, wet, bad anatomy, EasyNegative, letterbox, tattoo, (text:1.1), letterboxed, (colored skin:1.2)',
            'sd_model_checkpoint': req.body['sd_model_checkpoint'],
            'sampler_name': 'DPM++ 2M SDE Karras',
            'denoising_strength': '0.5',
            "cfg_scale": 7,
            "enable_hr": true,
            "hr_upscaler": "R-ESRGAN 4x+ Anime6B",
            "hr_scale": 1.5,
            "alwayson_scripts": {
                "ADetailer": {
                    "args": [
                        true,
                        {
                            "ad_model": "face_yolov8n.pt",
                            // "ad_prompt": "",
                            // "ad_negative_prompt": "",
                            // "ad_confidence": 0.3,
                            // "ad_mask_min_ratio": 0.0,
                            // "ad_mask_max_ratio": 1.0,
                            // "ad_dilate_erode": 32,
                            // "ad_x_offset": 0,
                            // "ad_y_offset": 0,
                            // "ad_mask_merge_invert": "None",
                            // "ad_mask_blur": 4,
                            // "ad_denoising_strength": 0.4,
                            // "ad_inpaint_only_masked": true,
                            // "ad_inpaint_only_masked_padding": 0,
                            // "ad_use_inpaint_width_height": false,
                            // "ad_inpaint_width": 512,
                            // "ad_inpaint_height": 512,
                            // "ad_use_steps": true,
                            // "ad_steps": 28,
                            // "ad_use_cfg_scale": false,
                            // "ad_cfg_scale": 7.0,
                            // "ad_restore_face": false,
                            // "ad_controlnet_model": "None",
                            // "ad_controlnet_weight": 1.0,
                            // "ad_controlnet_guidance_start": 0.0,
                            // "ad_controlnet_guidance_end": 1.0
                        },
                    ]
                }
            }
        };
        console.log(data)
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
        const list = await CheckPoint.findAll();
        return Common.successResult(res, {check_point: list}, "체크포인트조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.genderList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        console.log(req.query)
        const list = await Gender.findAll(req.query['sub_gender']);
        return Common.successResult(res, {list: list}, "성별 목록 조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.hairColorList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const list = await HairColor.findAll();
        return Common.successResult(res, {list: list}, "헤어 컬러 목록 조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.hairLengthList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const list = await HairLength.findAll();
        return Common.successResult(res, {list: list}, "헤어 길이 목록 조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.hairStyleList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const list = await HairStyle.findAll();
        return Common.successResult(res, {list: list}, "헤어 스타일 목록 조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.hairCostumeList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        let gender = req.query['gender'];
        if (gender === 'girl') {
            gender = 1;
        } else if (gender === 'boy') {
            gender = 2;
        } else {
            gender = 0;
        }
        const list = await Costume.findAll(gender);
        return Common.successResult(res, {list: list}, "코스튬 목록 조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.cutsecnPoseList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        let gender = req.query['gender'];
        let subCanvas = req.query['sub_canvas'];
        if (gender === 'girl') {
            gender = 1;
        } else if (gender === 'boy') {
            gender = 2;
        } else {
            gender = 0;
        }
        const list = await CutsecnPose.findAll(gender, subCanvas);
        return Common.successResult(res, {list: list}, " 조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.cutsecnBackList = async (req, res, next) => {
    Common.logData(null, req);
    try {
        let gender = req.query['gender'];
        if (gender === 'girl') {
            gender = 1;
        } else if (gender === 'boy') {
            gender = 2;
        } else {
            gender = 0;
        }
        const list = await CutsecnBack.findAll(gender);
        return Common.successResult(res, {list: list}, "조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.getProgress = async (req, res, next) => {
    Common.logData(null, req);
    try {
        // console.log(req.body);
        const url = 'http://112.169.41.227:7860/sdapi/v1/progress';
        const data ={};
        const resData = await Common.axiosGet(url, data);

        console.log({
            progress: resData.progress,
            eta_relative: resData.eta_relative,
            state: resData.state,
        })

        return Common.successResult(res, {
            progress: resData.progress,
            eta_relative: resData.eta_relative,
            state: resData.state,
        }, "조회성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.getQueueByFinish = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const list = await Queue.findByStatus_1();
        //1개만 조회한다
        let responseData = [];
        if (list.length > 0) {
            let base64Data = Buffer.from(list[0].image_data).toString('base64');
            responseData.push(base64Data);
            await Queue.updateStatusFinish(list[0]['queue_idx']);
            return Common.successResult(res, {list: responseData}, "결과 조회");
        }
        return Common.successResult(res, {list: responseData}, "결과 실패");

    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.postQueue = async (req, res, next) => {
    Common.logData(null, req);
    try {
        let prompt = req.body['prompt'];
        let sdModelCheckpoint = req.body['sd_model_checkpoint'];

        const list = await Queue.insertOne(prompt, sdModelCheckpoint);
        return Common.successResult(res, {list: list}, "대기열 등록 성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};
