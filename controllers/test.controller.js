const Common = require('../helpers/common');
const Queue = require('../models/queue_model');
const firebaseApp = require("../services/firebase.service");
const firestore = firebaseApp.firestore();

// SD 서버에 API 를 호출하는 곳으로, 테스트할때 사용한다.
// 여기서 이미지 생성 검증이 끝나면 runQueue._postSdServer 에 반영한다.
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
            "hr_scale": 1.0,
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


// 파이어베이스 데이터베이스 데이터 CRUD 테스트
exports.addTest = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const data = req.body;
        const user = await firestore.collection("CRUD_TEST").doc().set({name:'TEST', age: 14});
        return Common.successResult(res, {list: []}, "테스트 데이터 등록 성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};
exports.getTest = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const snapshot = await firestore.collection("CRUD_TEST").get();
        const data = snapshot;
        const usersArray = [];
        if (data.empty) {
            return Common.errorResult(res, {}, 'ERR', 200);
        } else {
            snapshot.forEach((doc) => {
                usersArray.push({id: doc.id, name: doc.data().name, age: doc.data().age});
            });
        }
        return Common.successResult(res, {list: usersArray}, "테스트 데이터 조회 성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

exports.updateTest = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const newUserData = req.body;
        const userID = req.params.id;
        const userSnapshot = await firestore.collection("CRUD_TEST").doc(userID);
        const userData = await userSnapshot.get();

        if (!userData.exists) {
            res.status(404).send("User with given ID not found");
        } else {
            userSnapshot.update(newUserData);
        }
        return Common.successResult(res, {list: usersArray}, "테스트 데이터 조회 성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

// 파이어베이스 푸시 테스트
exports.pushTest = async (req, res, next) => {
    Common.logData(null, req);
    try {
        const snapshot = await firestore.collection("CRUD_TEST").get();
        const data = snapshot;
        const usersArray = [];
        if (data.empty) {
            return Common.errorResult(res, {}, 'ERR', 200);
        } else {
            snapshot.forEach((doc) => {
                usersArray.push({name: doc.data().name, age: doc.data().age});
            });
        }
        return Common.successResult(res, {list: usersArray}, "테스트 데이터 조회 성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};
