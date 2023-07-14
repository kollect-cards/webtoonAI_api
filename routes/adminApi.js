const express = require('express');
const router = express.Router();

const passport = require('passport');
require('../middleware/passport')(passport);

router.get('/', function (req, res, next) {
    res.json({
        status: 'success',
        message: 'WEBTOON AI ADMIN API',
        data: { version_number: 'v1.0.0' }
    });
});
module.exports = router;  