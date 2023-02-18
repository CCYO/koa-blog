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
        NO_THIS_ONE: {errno: 303, msg: '沒有這個人'},
        AVATAR_FORMAT_ERR: {errno: 304, msg: 'avatar圖檔格式錯誤，只接受JPG或PNG'}
    },
    PERMISSION: {
        NOT_LOGIN: {errno: 501, msg: '從未登入'},
        NOT_SELF: {errno: 502, msg: '非本人'}
    },
    FORMAT_ERR: { errno: 601},
    BLOG: {
        CREATE_ERR: { errno: 701},
        NOT_EXIST: { errno: 702, msg: 'BLOG不存在'},
        NO_UPDATE: { errno: 703, msg: 'BLOG資料更新失敗'},
        UPDATE: {
            ERR_CREATE_BLOGFOLLOW: { errno: 704_1, msg: '創建BlogFollow數目與要求不匹配'},
        },
        UPLOAD_IMG_ERR: { errno: 704 },
        IMAGE_REMOVE_ERR: { errno: 705, msg: '刪除BlogImg時，數量對不上'},
        BLOG_REMOVE_ERR: {errno: 706, msg: '刪除Blog失敗'}
    },
    BLOGIMG: {
        REMOVE_ERR: { errno: 801, msg: '刪除BlogImg時，數量對不上'},
        UPDATE_ERR: { errno: 802, msg: '更新失敗'}
    },
    BLOGIMGALT: {
        UPDATE_ERR: { errno: 902, msg: '更新失敗'},
        REMOVE_ERR: { errno: 903, msg: '文章內的圖片數據初始化失敗'}
    },
    FOLLOW: {
        FOLLOW_ERR: { errno: 1001, msg: '追蹤失敗'},
        CANCEL_ERR: { errno: 1002, msg: '取消追蹤失敗'},
        CONFIRM_ERR: { errno: 1003, msg: '確認追蹤消息失敗'}
    },
    NEWS: {
        FOLLOW_CONFIRM_ERR: { errno: 1101, msg: 'Follow.confirm 更新失敗'},
        BLOG_FANS_CONFIRM_ERR: { errno: 1102, msg: 'Blog_Fans.confirm 更新失敗'},
        FOLLOW_COMMENT_CONFIRM_ERR: { errno: 1103, msg: 'Blog_Fans.confirm 更新失敗'}
    },
    SERVER_ERR: { errno: 9999, msg: '伺服器錯誤'}
}