const pool = require("../services/mysql.service");

const Gender = {
    findAll: async function (subGender) {
        let sqlQuery = `SELECT * FROM TB_SET_GENDER`;
         if (subGender !== null && subGender.toString() !== '0') {
             sqlQuery += ` WHERE gender = ${subGender} `;
         }
        sqlQuery += ` ORDER BY order_number ASC `;
        const [data, row] = await pool.query(sqlQuery, []);
        return data;
    },
}

module.exports = Gender;
