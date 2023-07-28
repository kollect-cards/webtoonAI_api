const pool = require("../services/mysql.service");

const CutscenePose = {
    findAll: async function (subGender, subCanvas) {
        let sqlQuery = `SELECT * FROM TB_CUTSCENE_POSE WHERE sub_gender = ? AND sub_canvas = ? ORDER BY order_number ASC`;
        const [data, row] = await pool.query(sqlQuery, [subGender, subCanvas]);
        return data;
    },
}

module.exports = CutscenePose;
