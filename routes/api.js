const express = require('express');
const router = express.Router();
const QueueController = require('../controllers/queue.controller');
const TestController = require('../controllers/test.controller');
const passport = require('passport');
require('../middleware/passport')(passport);

router.get('/', function (req, res, next) {
    res.json({
        status: 'success',
        message: 'WEBTOON AI API',
        data: { version_number: 'v1.0.0' }
    });
});

// API - 큐 관리용
router.get('/api/queue/finish', QueueController.getQueueByFinish);
router.post('/api/queue', QueueController.postQueue);

// TEST
router.post('/api/addTest', TestController.addTest);
router.get('/api/getTest', TestController.getTest);
router.post('/api/updTest', TestController.updateTest);
module.exports = router;









