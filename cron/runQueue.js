const CronJobManager = require('cron-job-manager');
const Common = require("../helpers/common");
const Queue = require("../models/queue_model");
const Config = require("../config/config");
manager = new CronJobManager();

const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
manager.add('runQueue', '* * * * *', async () => {
    Common.logData('      : runQueue start . . . ');
    try {
        if (Config.queue_status === 'stop'){                                      // stop 인 경우에 대해서만 최초 1회 실행
            Config.queue_status = 'on';

            while (true) {
                const status = await Queue.findStatus();
                if (status['running'] === 1) { //1이면 큐 조회 실행, 0이면 아무것도 안함
                    const readyQueue = await Queue.findByStatus_0();
                    if (readyQueue.length > 0) {
                        for (let i = 0; i < readyQueue.length; i++) {
                            console.log(`image 생성중 ... ${readyQueue[i]['queue_idx']}`);
                            const result = await _postSdServer(readyQueue[i]['prompt'],readyQueue[i]['checkpoint'],);
                            let binaryImage = Buffer.from(result[0], 'base64');
                            await Queue.updateOne(readyQueue[i]['queue_idx'], binaryImage, result === null ? 2 : 1);
                            console.log(`image 생성 완료! ${Common.getDateString(1)}`);
                        }
                    }else {
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
    }
});


const _postSdServer = async (prompt, checkpoint) => {
    try {
        const url = 'http://112.169.41.227:7860/sdapi/v1/txt2img';
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
                        },
                    ]
                }
            }
        };
        const resData = await Common.axiosPost(url, data);
        if (resData.images.length === 0) {
            return  null;
        }
        return resData.images;
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

manager.start('runQueue');