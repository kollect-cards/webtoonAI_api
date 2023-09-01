const CronJobManager = require('cron-job-manager');
const Common = require("../helpers/common");
const Queue = require("../models/queue_model");
const Config = require("../config/config");
const firebaseApp = require("../services/firebase.service");
const firestore = firebaseApp.firestore();
const firebaseAdmin = require("firebase-admin");
manager = new CronJobManager();

const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
manager.add('runQueue', '* * * * *', async () => {
    try {
        if (Config.queue_status === 'stop'){                                      // stop 인 경우에 대해서만 최초 1회 실행,
                                                                                  // CRON 이 매분 실행되더라도, queue_status  값이 on 상태이면 중복 실행되지 않는다.
            Config.queue_status = 'on';                                           // 프로세스를 계속 실행 시키는 상태로 두면서 중복 실행을 방지한다.
            while (true) {
                const status = await Queue.findStatus();
                if (status['running'] === 1) { // 1이면 큐 조회 실행, 0이면 아무것도 안함 (DB.TB_QUEUE_STATUS.running = 1 인경우 실행하며 종료하고 싶을때에는 0으로 업데이트
                    const basicReadyQueue = await Queue.findByStatus_0('basic|standard|premium');
                    // const basicReadyQueue = await Queue.findByStatus_0('basic'); // 스탠다드 / 프리미엄 서버 생기면 주석 해제
                    if (basicReadyQueue.length > 0) {
                        for (let i = 0; i < basicReadyQueue.length; i++) {
                            console.log(`image 생성중 ... ${basicReadyQueue[i]['queue_idx']}`);
                            let images = [];
                            for (let j = 0; j < basicReadyQueue[i]['image_cnt']; j++) {
                                const resultBySdServer = await _postSdServer('http://112.169.41.227:7860', basicReadyQueue[i]['prompt'], basicReadyQueue[i]['checkpoint'], basicReadyQueue[i]['canvas_type'],);
                                let binaryImage = Buffer.from(resultBySdServer[0], 'base64');
                                images.push(binaryImage);
                            }
                            await Queue.updateOne(basicReadyQueue[i]['queue_idx'], images, images.length === basicReadyQueue[i]['image_cnt'] ? 1 : 2);
                            const objectID = basicReadyQueue[i]['object_id'];
                            const makeType = basicReadyQueue[i]['make_type']; // preset or cutscene
                            const pushToken = basicReadyQueue[i]['push_token'];
                            const objectSnapshot = await firestore.collection(makeType).doc(objectID);
                            const objectData = await objectSnapshot.get();
                            if (!objectData.exists) {
                                objectSnapshot.update({create_status: 'error'}); // pending: 대기중, error: 에러, finish: 생성완료, view_completed: 조회완료,  saved: 사용자 저장까지 완료
                                console.log(`image 생성 저장 실패! ${Common.getDateString(1)}`);
                            } else {
                                objectSnapshot.update({create_status: 'finish'}); //
                                if (pushToken !== null && pushToken !== undefined && pushToken !== '') {
                                    _postPushMessage('WEBTOON_AI', `${makeType} 생성 완료!`, [pushToken]);
                                }
                                console.log(`image 생성 완료! ${Common.getDateString(1)}`);
                            }
                        }
                    }else {
                        await Queue.deleteStatusFinish(); // 완료된 큐 삭제
                        await _sleep(3000);
                        console.log(`QUEUE 쉬는중 ... `);
                    }
                }else {
                    console.log(`QUEUE 전원 OFF ... `);
                    await _sleep(10000);
                }
            }
        }

    }catch (e) {
        console.log(e);
        Config.queue_status = 'stop';
    }
});

// 스탠다드 / 프리미엄 서버 생기면 주석 해제
// manager.add('runQueueByStandardAndPremium', '* * * * *', async () => {
//     try {
//         if (Config.queue_status_standard === 'stop'){
//             Config.queue_status_standard = 'on';
//             while (true) {
//                 const status = await Queue.findStatus();
//                 if (status['running'] === 1) { // 1이면 큐 조회 실행, 0이면 아무것도 안함 (DB.TB_QUEUE_STATUS.running = 1 인경우 실행하며 종료하고 싶을때에는 0으로 업데이트
//                     const readyQueue = await Queue.findByStatus_0('standard|premium');
//                     if (readyQueue.length > 0) {
//                         for (let i = 0; i < readyQueue.length; i++) {
//                             console.log(`스탠다드|프리미엄 image 생성중 ... ${readyQueue[i]['queue_idx']}`);
//                             const result = await _postSdServer('스탠다드|프리미엄용 SD SERVER URL 입력하세요', readyQueue[i]['prompt'], readyQueue[i]['checkpoint'], readyQueue[i]['canvas_type'],);
//                             let binaryImage = Buffer.from(result[0], 'base64');
//                             await Queue.updateOne(readyQueue[i]['queue_idx'], binaryImage, result === null ? 2 : 1);
//                             console.log(`스탠다드|프리미엄 image 생성 완료! ${Common.getDateString(1)}`);
//                         }
//                     }else {
//                         await _sleep(3000);
//                         console.log(`QUEUE 쉬는중 ... `);
//                     }
//                 }else {
//                     console.log(`QUEUE 전원 OFF ... `);
//                     await _sleep(10000);
//                 }
//             }
//         }
//
//     }catch (e) {
//         console.log(e);
//     }
// });


const _postSdServer = async (sdServerUrl, prompt, checkpoint, canvasType) => {
    //1: square (정사각) 512*512, 2: vertical  (가로 긴 직사각) 768*512, 3: horizontal (세로 긴 직사각) 512*768
    let width = canvasType === 'vertical' ? 768 : 512;
    let height = canvasType === 'horizontal' ? 768 : 512;

    try {
        const data = {
            // 'steps': req.body['steps'],
            'steps': 20,
            'prompt': '((best quality, high_resolution, distinct_image)) ' + prompt,
            'negative_prompt': 'worst quality, low quality, watermark, text, error, blurry, jpeg artifacts, worst quality, low quality, normal quality, jpeg artifacts, signature, username, artist name, wet, bad anatomy, EasyNegative, letterbox, tattoo, (text:1.1), letterboxed, (colored skin:1.2)',
            'sd_model_checkpoint': checkpoint,
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
                            "ad_inpaint_width": width,
                            "ad_inpaint_height": height,
                        },
                    ]
                }
            }
        };
        const resData = await Common.axiosPost(sdServerUrl+'/sdapi/v1/txt2img', data);
        if (resData.images.length === 0) {
            return  null;
        }
        return resData.images;
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

// 파이어베이스 푸시 전송 (이미시 생성 완료)
const _postPushMessage = (title, body, tokens)=>{
    let message = {
        notification: { title: title, body: body},
        data: { title: title, body: body},
        tokens: tokens
    };
    firebaseAdmin.messaging().sendMulticast(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}
manager.start('runQueue');