const errorCodeModel = {
    ERR: {code: 10000, message: {kr: "ERROR"}},
    ERR_AUTH_FAIL: {code: 10001, message: {kr: "AUTH ERR"}},
    ERR_AUTH_PASSPORT: {code: 10002, message: {kr: "PASSPORT ERR"}},
    ERR_AUTH_WITHDRAWAL: {code: 10003, message: {kr: "탈퇴 유저"}},
    ERR_REQUIRED_VALUES: {code: 9998, message: {kr: "파라매터값 부족"}},

    ERR_AUTH_GOOGLE_NO_TOKEN: {code: 10101, message: {kr: "'token' 파라매터 값 부족"}},
    ERR_AUTH_GOOGLE_NO_UNIQUE_ID: {code: 10102, message: {kr: "'unique_id' 파라매터 값 부족"}},
}
module.exports = {errorCodeModel};