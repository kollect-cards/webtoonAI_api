require('dotenv').config(); //instatiate environment variables

let CONFIG = {}; //Make this global to use all over the application

CONFIG.timezone = "Asia/Seoul"
CONFIG.app = process.env.APP || 'dev';
CONFIG.port = process.env.PORT || '3000';
CONFIG.secret = process.env.SECRET || '-';
CONFIG.queue_status = 'stop';
CONFIG.queue_status_standard = 'stop';


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
    api_key: process.env.API_KEY || 'none',
    auth_domain: process.env.AUTH_DOMAIN || 'none',
    database_url: process.env.DATABASE_URL || 'none',
    project_id: process.env.PROJECT_ID || 'none',
    storage_bucket: process.env.STORAGE_BUCKET || 'none',
    messaging_sender_id: process.env.MESSAGING_SENDER_ID || 'none',
    app_id: process.env.APP_ID || 'none',
    service_account_path: process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY
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
CONFIG.schedule = null;
CONFIG.sentry_dns=process.env.SENTRY_DNS;

module.exports = CONFIG;


