/**
 * @description 錯誤訊息
 */

module.exports = {
    FOLLOWBLOG: {
        CREATE_ERROR: { errno: 1301, msg: 'FollowBlog 創建失敗'},
        DEL_ERR: { errno: 1302, msg: '刪除關聯失敗' },        //  0228
    },
    BLOGIMGALT: {
        REMOVE_ERR: { errno: 903, msg: 'BlogImgAlt刪除失敗' },    //  0326
        CREATE_ERR: { errno: 901, msg: 'BlogImgAlt創建失敗'},           //  0326
        NOT_EXIST: { errno: 902, msg: '不存在任何相符的 BlogImgAlt'},    //  0326
        UPDATE_ERR: { errno: 902, msg: '更新失敗' },
    },
    BLOG: {
        CREATE_ERR: { errno: 701, msg: 'Blog創建失敗' },                //  0326
        UPLOAD_IMG_ERR: { errno: 704, msg: 'Blog內文圖片上傳失敗' },    //  0326
        NOT_EXIST: { errno: 702, msg: 'BLOG不存在' },        //  0228
        UPDATE_ERR: { errno: 703, msg: 'BLOG資料更新失敗' },                //  0326
        IMAGE_REMOVE_ERR: { errno: 705, msg: '刪除BlogImg時，數量對不上' },
        BLOG_REMOVE_ERR: { errno: 706, msg: '刪除Blog失敗' }
    },
    REGISTER: {
        NO_EMAIL: { errno: 102, msg: '信箱未填' },          //  0323
        NO_PASSWORD: { errno: 103, msg: '密碼未填' },       //  0323
        IS_EXIST: { errno: 101, msg: '此信箱已被登記' },    //  0323

        UNEXPECTED: { errno: 199 },



    },
    LOGIN: {
        DATA_IS_INCOMPLETE: { errno: 104, msg: '未提供email或password' },
        NO_USER: { errno: 105, msg: '查無此人，email或password有誤' }
    },
    READ: {
        NOT_EXIST: { errno: 201, msg: '沒有相符的使用者資料' }
    },
    UPDATE: {
        INVALICATE: { errno: 301 },
        UNEXPECTED: { errno: 399 },
        VALICATE_ERR: { errno: 302 },
        NO_THIS_ONE: { errno: 303, msg: '沒有這個人' },
        AVATAR_FORMAT_ERR: { errno: 304, msg: 'avatar圖檔格式錯誤，只接受JPG或PNG' }
    },
    PERMISSION: {
        NOT_LOGIN: { errno: 501, msg: '從未登入' },
        NOT_SELF: { errno: 502, msg: '非本人' }
    },
    FORMAT_ERR: { errno: 601 },
    
    BLOGIMG: {
        REMOVE_ERR: { errno: 801, msg: '刪除 BlogImg 失敗' },
        UPDATE_ERR: { errno: 802, msg: '更新失敗' },
        CREATE_ERR: { errno: 803, msg: '創建失敗'}
    },
    COMMENT: {
        REMOVE_ERR: { errno: 1101, msg: '文章刪除失敗' }
    },
    FOLLOW: {
        FOLLOW_ERR: { errno: 1001, msg: '追蹤失敗' },            //  0228
        CANCEL_ERR: { errno: 1002, msg: '取消追蹤失敗' },        //  0228
        CONFIRM_ERR: { errno: 1003, msg: '確認追蹤消息失敗' }
    },
    
    FOLLOWCOMMENT: {
        UPDATE_ERR: { errno: 1401, msg: 'FollowComment更新失敗' }
    },
    NEWS: {
        FOLLOW_CONFIRM_ERR: { errno: 1101, msg: 'Follow.confirm 更新失敗' },
        BLOG_FANS_CONFIRM_ERR: { errno: 1102, msg: 'Blog_Fans.confirm 更新失敗' },
        FOLLOW_COMMENT_CONFIRM_ERR: { errno: 1103, msg: 'Blog_Fans.confirm 更新失敗' }
    },
    SERVER_ERR: { errno: 9999, msg: '伺服器錯誤' }
}