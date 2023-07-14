require('dotenv').config(); //instatiate environment variables

let jwtconfig = {}; //Make this global to use all over the application

jwtconfig.secret = process.env.SECRET;

jwtconfig.option = process.env.JWT_OPTION || {
    algorithm : process.env.ALGORITHMS || 'HS256', // 해싱 알고리즘
    // expiresIn : "1m",  // 토큰 유효 기간
    issuer : "issuer" // 발행자
};
jwtconfig.optionRefreshToken = process.env.JWT_OPTION || {
    algorithm : process.env.ALGORITHMS || 'HS256', // 해싱 알고리즘
    expiresIn : "90d",  // 토큰 유효 기간
    issuer : "issuer" // 발행자
};



module.exports = jwtconfig;