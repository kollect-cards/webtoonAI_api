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
    findByStatus_0: async function () {
        let sqlQuery = `SELECT * FROM TB_QUEUE WHERE queue_status = 0`;
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    },
    findByStatus_1: async function () {
        let sqlQuery = `SELECT * FROM TB_QUEUE WHERE queue_status = 1`;
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    },
    insertOne: async function (prompt, checkPoint) {
        let sqlQuery = `INSERT INTO TB_QUEUE (user_idx, prompt, checkpoint, queue_status, insert_dt)
                        VALUES (?, ?, ?, ?, ?) `;
        const [data, row] = await pool.query(sqlQuery, [null, prompt, checkPoint, 0, new Date()]);
        return data;
    },
    updateOne: async function (queueIdx, imageData, status) {
        let sqlQuery = `UPDATE TB_QUEUE SET queue_status = ?, image_data = ?, update_dt = ?
                        WHERE queue_idx = ? `;
        const [data, row] = await pool.query(sqlQuery, [status, imageData, new Date(), queueIdx]);
        return data;
    },
    updateStatusFinish: async function (queueIdx) {
        let sqlQuery = `UPDATE TB_QUEUE SET queue_status = 3, finish_dt = ?
                        WHERE queue_idx = ? `;
        const [data, row] = await pool.query(sqlQuery, [new Date(), queueIdx]);
        return data;
    }
}

module.exports = Queue
