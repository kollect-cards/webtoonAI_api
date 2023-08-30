const Common = require('../helpers/common');
const Queue = require('../models/queue_model');
const firebaseApp = require("../services/firebase.service");
const firestore = firebaseApp.firestore();


// API: 사용자가 대기열에 이미지 생성을 요청
exports.postQueue = async (req, res, next) => {
    Common.logData(null, req);
    try {
        let userId = req.body['user_id']        // 대기열에 등록하는 사람의 아이디 (firebase.collection.users 의 doc.id)
        let objectId = req.body['object_id']    // 대기열에 등록하는 오브젝트의 아이디 (firebase.collection.preset or cutscene 의 doc.id)
        let userLevel = req.body['user_level']; // basic, standard, premium 중 한개인지 체크
        let makeType = req.body['make_type'];   // 프리셋(preset) OR 컷씬(cutscene)
        let prompt = req.body['prompt'];                         // 프롬프트
        let sdModelCheckpoint = req.body['sd_model_checkpoint']; // 체크아웃포인트
        let canvasType = req.body['canvas_type'];                // 캔버스타입 (컷씬인 경우에만 저장) 1: square (정사각), 2: vertical  (가로 긴 직사각), 3 horizontal (세로 긴 직사각)
        let pushToken = req.body['push_token'];                  // 푸시토큰 / 알림 발송하는 경우에만 값이 있음

        const list = await Queue.insertOne(userId, objectId, userLevel, makeType, prompt, sdModelCheckpoint, canvasType, pushToken);
        return Common.successResult(res, {}, "대기열 등록 성공");
    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};

// API: 앱에서 사용자가 완료된 이미지만 조회하는 경우 요청
exports.getQueueByFinish = async (req, res, next) => {
    Common.logData(null, req);
    try {
        let objectId = req.query['object_id'];
        let makeType = req.query['make_type']; //프리셋(preset) OR 컷씬(cutscene)
        const list = await Queue.findByStatus_1(objectId, makeType);
        //1개만 조회한다
        let responseData = [];
        if (list.length > 0) {
            let base64Data = Buffer.from(list[0].image_data).toString('base64');
            responseData.push(base64Data);
            await Queue.updateStatusFinish(list[0]['queue_idx']);

            const objectSnapshot = await firestore.collection(list[0]['make_type']).doc(list[0]['object_id']);
            const objectData = await objectSnapshot.get();
            if (!objectData.exists) {
                objectSnapshot.update({create_status: 'error'}); // pending: 대기중, error: 에러, finish: 생성완료, view_completed: 조회완료,  saved: 사용자 저장까지 완료
                console.log(`image 조회 실패! ${Common.getDateString(1)}`);
            } else {
                objectSnapshot.update({create_status: 'view_completed'}); // 파이어베이스 데이터 업데이트
            }
            return Common.successResult(res, {list: responseData}, "결과 조회");
        }
        return Common.successResult(res, {list: responseData}, "결과 실패");

    } catch (e) {
        console.log(e)
        return Common.errorResult(res, {}, 'ERR', 200);
    }
};
