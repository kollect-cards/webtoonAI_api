const pool = require("../services/mysql.service");
const Common = require("../helpers/common");

const Queue = {
    findStatus: async function () {
        let sqlQuery = `SELECT * FROM TB_QUEUE_STATUS`;
        const [data, row] = await pool.query(sqlQuery, []);
        let obj = {};
        data.map(d=>{
            obj[d.key] = d.value;
        });
        return obj;
    },
    findAll: async function () {
        let sqlQuery = `SELECT * FROM TB_QUEUE`;
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    },
    // status 0: 대기, 1: 생성완료, 2: 실패, 3: 조회완료
    findByStatus_0: async function (userLevel) {
        let sqlQuery = `SELECT * FROM TB_QUEUE WHERE queue_status = 0 and user_level regexp ? ORDER BY user_level DESC, queue_idx ASC`;
        const [data, row] = await pool.query(sqlQuery, [userLevel]);
        return data;
    },
    findByStatus_1: async function (objectId, makeType) {
        let sqlQuery = `SELECT * FROM TB_QUEUE WHERE queue_status = 1 AND object_id = ? AND make_type = ?`;
        const [data, row] = await pool.query(sqlQuery, [objectId, makeType]);
        return data;
    },
    insertOne: async function (userId, objectId, userLevel, makeType, prompt, sdModelCheckpoint, canvasType, pushToken, makeCnt) {
        let sqlQuery = `INSERT INTO TB_QUEUE (user_id, object_id, user_level, make_type, prompt, checkpoint, canvas_type, push_token, queue_status, image_cnt, insert_dt)VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;
        const [data, row] = await pool.query(sqlQuery, [userId, objectId, userLevel, makeType, prompt, sdModelCheckpoint, canvasType, pushToken, 0, makeCnt, new Date()]);
        return data;
    },
    updateOne: async function (queueIdx, imageData, status) {
        let image0 = imageData.length >= 1 ? imageData[0] : null;
        let image1 = imageData.length >= 2 ? imageData[1] : null;
        let image2 = imageData.length >= 3 ? imageData[2] : null;
        let image3 = imageData.length >= 4 ? imageData[3] : null;
        let sqlQuery = `UPDATE TB_QUEUE 
                        SET queue_status = ?, image_data = ?, image_data_1 = ?, image_data_2 = ?, image_data_3 = ?, update_dt = ?
                        WHERE queue_idx = ? `;
        const [data, row] = await pool.query(sqlQuery, [status, image0, image1, image2, image3, new Date(), queueIdx]);
        return data;
    },
    updateStatusFinish: async function (queueIdx) {
        let sqlQuery = `UPDATE TB_QUEUE SET queue_status = 3, finish_dt = ?
                        WHERE queue_idx = ? `;
        const [data, row] = await pool.query(sqlQuery, [new Date(), queueIdx]);
        return data;
    },
    deleteStatusFinish: async function (queueIdx) {
        let sqlQuery = `DELETE FROM TB_QUEUE WHERE queue_status = 3`;
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    }
}

module.exports = Queue
