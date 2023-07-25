require('dotenv').config(); //instatiate environment variables

let CONFIG = {}; //Make this global to use all over the application

CONFIG.timezone = "Asia/Seoul"
CONFIG.app = process.env.APP || 'dev';
CONFIG.port = process.env.PORT || '3000';
CONFIG.secret = process.env.SECRET || '-';
CONFIG.queue_status = 'stop';


CONFIG.bucket_url = process.env.BUCKET_URL || '';

CONFIG.db_dialect = process.env.DB_DIALECT || '';
CONFIG.db_host = process.env.DB_HOST || '';
CONFIG.db_port = process.env.DB_PORT || '';
CONFIG.db_name = process.env.DB_NAME || '';
CONFIG.db_user = process.env.DB_USER || '';
CONFIG.db_password = CONFIG.app === 'dev' || CONFIG.app === 'local' ? 'Crw2022#$%dev' : process.env.DB_PASSWORD;

CONFIG.aws_key = process.env.aws_access_key_id || 'none';
CONFIG.aws_secret = process.env.aws_secret_access_key || 'none';

CONFIG.firebase = {
    service_account_key: process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY || 'none'
}

CONFIG.naver = {
    secret_key: process.env.NAVER_SECRET_KEY || 'none',
    access_key_id: process.env.NAVER_ACCESS_KEY_ID || 'none',
    service_id_sms: process.env.NAVER_SERVICE_ID_SMS || 'none',
    from_call_number: process.env.NAVER_FROM_CALL_NUMBER || 'none'
}

CONFIG.oauth = {
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID || 'hash',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'hash',
        redirectURL: process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/callback/google',
        appClientIDs: [
            process.env.GOOGLE_APP_CLIENT_AOS, process.env.GOOGLE_APP_CLIENT_IOS, process.env.GOOGLE_CLIENT_ID,
            '407408718192.apps.googleusercontent.com'
        ]
    },
    apple: {
        bundleId: process.env.APPLE_BUNDLE_ID || 'hash',
        clientID: process.env.APPLE_CLIENT_ID || 'hash',
        teamID: process.env.APPLE_TEAM_ID || 'hash',
        keyID: process.env.APPLE_OAUTH_KEY_ID || 'hash',
        redirectURL: process.env.APPLE_OAUTH_REDIRECT_URL || 'http://localhost:3000/auth/login/apple',
        scope: process.env.APPLE_OAUTH_SCOPE || 'email,name',
        keyLocation: process.env.APPLE_OAUTH_KEY_LOCATION || '',
    },
};

CONFIG.isShowLog = 1;

CONFIG.giftshow = {
    custom_auth_code: process.env.GIFTISHOW_CUSTOM_AUTH_CODE,
    custom_auth_token: process.env.GIFTISHOW_CUSTOM_AUTH_TOKEN,
    dev_yn: process.env.GIFTISHOW_DEV_YN,
    banner_id: process.env.GIFTISHOW_BANNER_ID,
    card_id: process.env.GIFTISHOW_CARD_ID,
    user_id: process.env.GIFTISHOW_USER_ID,
}

CONFIG.schedule = null;
CONFIG.sentry_dns=process.env.SENTRY_DNS;

module.exports = CONFIG;


