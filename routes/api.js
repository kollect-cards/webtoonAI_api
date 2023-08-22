const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const AuthController = require('../controllers/auth.controller');
const TestController = require('../controllers/test.controller');
const characterSetController = require('../controllers/character-set.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const passport = require('passport');
require('../middleware/passport')(passport);

router.get('/', function (req, res, next) {
    res.json({
        status: 'success',
        message: 'WEBTOON AI API',
        data: { version_number: 'v1.0.0' }
    });
});

const auth = passport.authenticate('jwt', {failureRedirect: '/auth/fail', session: false, ignoreExpiration:false});
const refresh = passport.authenticate('jwt_refresh', {failureRedirect: '/auth/fail', session: false, ignoreExpiration:false});

router.post('/auth/login/google', AuthController.loginGoogle);
router.post('/auth/sign/:sns_type', AuthController.signSNS);
router.post('/auth/login/non-member', AuthController.loginNonMember);
router.post('/auth/sign/non-member/', AuthController.signNonMember);

router.get('/api/checkPoint/list', TestController.checkPointList);
router.get('/api/gender/list', TestController.genderList);
router.get('/api/hair/color/list', TestController.hairColorList);
router.get('/api/hair/length/list', TestController.hairLengthList);
router.get('/api/hair/style/list', TestController.hairStyleList);
router.get('/api/cutscene/pose/list', TestController.cutsecnPoseList);
router.get('/api/cutscene/back/list', TestController.cutsecnBackList);
router.get('/api/costume/list', TestController.hairCostumeList);
router.get('/api/progress', TestController.getProgress);

// NEW
router.get('/character-set/check_point/list', auth, characterSetController.checkPointList);


router.post('/api/img/create', TestController.txtToImg);
router.get('/api/queue/finish', TestController.getQueueByFinish);
router.post('/api/queue', TestController.postQueue);
module.exports = router;









