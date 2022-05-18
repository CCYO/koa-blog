/**
 * @description 錯誤訊息
 */

module.exports = {
    REGISTER: {
        UNEXPECTED: {errno: 199},
        IS_EXIST: {errno: 101, msg: '此信箱已被登記'},
        NO_EMAIL: {errno: 102, msg: '信箱未填'},
        NO_PASSWORD: {errno: 103, msg: '密碼未填'}
    },
    READ: {
        NOT_EXIST: {errno: 201, msg: '沒有相符的使用者資料'}
    },
    UPDATE: {
        INVALICATE: { errno: 301},
        UNEXPECTED: {errno: 399},
        VALICATE_ERR: {errno: 302},
        NO_THIS_ONE: {error: 303, msg: '沒有這個人'}
    },
    LOGIN: {
        NOT_LOGIN: {errno: 501, msg: '未登入'}
    },
    FORMAT_ERR: { errno: 601},
    BLOG: {
        CREATE_ERR: { errno: 701},
        NOT_EXIST: { errno: 702, msg: 'BLOG不存在'},
        NO_UPDATE: { errno: 703, msg: 'BLOG資料更新失敗'},
        UPLOAD_IMG_ERR: { errno: 704 },
        IMAGE_REMOVE_ERR: { errno: 705, msg: '刪除BlogImg關聯紀錄失敗'}
    }
}