/**
 * @description 錯誤訊息
 */

module.exports = {
    REGISTER: {
        UNEXPECTED: {errno: 199},
        IS_EXIST: {errno: 101, msg: '此帳號已被登記'},
        NO_USERNAME: {errno: 102, msg: '帳號未填'},
        NO_PASSWORD: {errno: 103, msg: '密碼未填'}
    },
    READ: {
        NOT_EXIST: {errno: 201, msg: '沒有相符的使用者資料'}
    },
    UPDATE: {
        INVALICATE: { errno: 301},
        UNEXPECTED: {errno: 399},
    },
    LOGIN: {
        NOT_LOGIN: {errno: 501, msg: '未登入'}
    }
}