const pool = require("../services/mysql.service");

const HairColor = {
    findAll: async function () {
        let sqlQuery = `SELECT * FROM TB_SET_HAIR_COLOR ORDER BY order_number ASC`;
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    },
}

module.exports = HairColor;
