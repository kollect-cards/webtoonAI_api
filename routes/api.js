const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const AuthController = require('../controllers/auth.controller');
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

// auth
router.post('/auth/login/non-member', AuthController.loginNonMember);
router.post('/auth/sign/non-member/', AuthController.signNonMember);
module.exports = router;  