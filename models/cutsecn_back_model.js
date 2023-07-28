const pool = require("../services/mysql.service");

const CutsceneBack = {
    findAll: async function (gender) {
        let sqlQuery = `SELECT * FROM TB_CUTSCENE_BACKGROUND WHERE sub_gender = ? ORDER BY order_number ASC`;
        const [data, row] = await pool.query(sqlQuery, [gender]);
        return data;
    },
}

module.exports = CutsceneBack;
