const pool = require("../services/mysql.service");

const CheckPoint = {
    findAll: async function () {
        let sqlQuery = 'SELECT * FROM TB_CHECK_POINT ORDER BY order_number ASC ';
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    },
}

module.exports = CheckPoint;
