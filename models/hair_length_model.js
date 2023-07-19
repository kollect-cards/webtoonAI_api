const pool = require("../services/mysql.service");

const HairLength = {
    findAll: async function () {
        let sqlQuery = `SELECT * FROM TB_SET_HAIR_LENGTH ORDER BY order_number ASC`;
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    },
}

module.exports = HairLength;
