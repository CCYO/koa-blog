/**
 * @description 錯誤訊息
 */

module.exports = {
    //  0406
    BLOG_IMG_ALT: {
        //  0408
        READ: {
            //  0410
            NO_DATA: { errno: 50002, msg: '查詢 BLOG_IMG_ALT 卻沒提供參數' },
            //  0408
            NOT_EXIST: { errno: 50003, msg: '不存在任何相符的 BlogImgAlt' },
        },
        //  0408
        DELETE: {
            ERR: { errno: 801, msg: '刪除 BlogImgAlt 失敗' },
            //  0406
            ROW: { errno: 40003, msg: '刪除 BlogImgAlt 的數量不完全' },
        },
        //  0406
        CREATE: {
            //  0406
            NO_DATA: { errno: 50002, msg: '創建 BLOG_IMG_ALT 卻沒提供參數' },
            //  0406
            ERR: { errno: 50001, msg: 'BlogImgAlt創建失敗' },
        },
        REMOVE_ERR: { errno: 903, msg: 'BlogImgAlt刪除失敗' },    //  0326
        UPDATE_ERR: { errno: 902, msg: '更新失敗' },
    },
    //  0406
    BLOG_IMG: {
        //  0406
        CREATE: {
            //  0406
            NO_DATA: { errno: 50002, msg: '創建 BLOG_IMG 卻沒提供參數' },
            //  0406
            ERR: { errno: 50001, msg: 'BlogImg創建失敗' },
        },
        DELETE: {
            ERR: { errno: 801, msg: '刪除 BlogImg 失敗' },
            //  0406
            ROW: { errno: 40003, msg: '刪除 BlogImg 的數量不完全' },
        },
        
        UPDATE_ERR: { errno: 802, msg: '更新失敗' },
        CREATE_ERR: { errno: 803, msg: '創建失敗' }
    },
    //  0406
    ARTICLE_READER: {
        //  0406
        CREATE: {
            ROW: { errno: 40005, msg: '創建 ArticleReader 的數量不完全' },
            ERR: { errno: 40005, msg: 'ArticleReader 創建失敗' },
        },
        //  0406
        RESTORE: {
            ROW: { errno: 40004, msg: '恢復軟刪除 ArticleReader 的數量不完全' },
        },
        //  0406
        DELETE: {
            //  0406
            ROW_ERR: { errno: 40003, msg: '刪除 ArticleReader 的數量不完全' },
        }
    },
    //  0406
    IMG: {
        //  0406
        CREATE: {
            //  0406
            NO_DATA: { errno: 50002, msg: '創建 IMG 卻沒提供參數' },
            //  0406
            ERR: { errno: 50001, msg: 'IMG 創建失敗' },
        },
        NO_DATA: { errno: 40001, msg: '沒有相符的 IMG' }
    },
    //  0404
    BLOG: {
        //  0409
        UPDATE: { errno: 30004, msg: 'BLOG資料更新失敗' },
        //  0406
        CREATE: { errno: 30003, msg: 'BLOG 創建失敗' },
        //  0404
        READ: {
            //  0404
            NOT_EXIST: { errno: 30002, msg: 'BLOG不存在' },
            //  0404
            NO_DATA: { errno: 30001, msg: '查詢 BLOG 卻沒提供查詢參數' }
        },
        UPLOAD_IMG_ERR: { errno: 704, msg: 'Blog內文圖片上傳失敗' },    //  0326
        IMAGE_REMOVE_ERR: { errno: 705, msg: '刪除BlogImg時，數量對不上' },
        REMOVE_ERR: { errno: 706, msg: '刪除Blog失敗' }
    },
    //  0406
    IDOL_FANS: {
        //  0406
        RESTORE: {
            ROW_ERR: { errno: 40004, msg: '恢復軟刪除 IdolFans 的數量不完全' },
        },
        //  0406
        DELETE: {
            //  0406
            ROW_ERR: { errno: 40003, msg: '刪除 IdolFans 的數量不完全' },
            //  0406
            NO_IDOL: { errno: 40002, msg: '要刪除的 Idol 不存在' }
        },
        //  0406
        CREATE_ERR: { errno: 40001, msg: 'IdolFans 創建失敗' },
        //  0228
        CONFIRM_ERR: { errno: 1003, msg: '確認追蹤消息失敗' }
    },
    //  0404
    PERMISSION: {
        //  0404
        NO_LOGIN: { errno: 20001, msg: '尚未登入' },

        NOT_SELF: { errno: 502, msg: '非本人' },
    },
    //  
    USER: {
        //  0404
        READ: {
            //  0406
            NO_USER: { errno: 12002, msg: '找不到 USER' },
            //  0404
            NO_DATA: { errno: 12001, msg: 'USER 無相關數據' }
        },
        //  0404
        LOGIN: {
            //  0404
            NO_USER: { errno: 11002, msg: '查無此人，email或password有誤' },
            //  0404
            DATA_INCOMPLETE: { errno: 11001, msg: '未提供email或password' }
        },
        //  0404
        REGISTER: {
            //  0404
            CREATE: { errno: 10004, msg: 'USER 創建失敗' },
            //  0404
            NO_PASSWORD: { errno: 10003, msg: '密碼未填' },
            //  0404
            NO_EMAIL: { errno: 10002, msg: '信箱未填' },
            //  0404
            IS_EXIST: { errno: 10001, msg: '此信箱已被登記' }
        },
    },
    NEWS: {


        FOLLOW_CONFIRM_ERR: { errno: 1101, msg: 'Follow.confirm 更新失敗' },
        BLOG_FANS_CONFIRM_ERR: { errno: 1102, msg: 'Blog_Fans.confirm 更新失敗' },
        FOLLOW_COMMENT_CONFIRM_ERR: { errno: 1103, msg: 'Blog_Fans.confirm 更新失敗' }
    },




    READ: {
        NOT_EXIST: { errno: 201, msg: '沒有相符的使用者資料' }
    },
    UPDATE: {
        INVALICATE: { errno: 301 },
        UNEXPECTED: { errno: 399 },
        VALICATE_ERR: { errno: 302 },
        NO_THIS_ONE: { errno: 303, msg: '沒有這個人' },
        AVATAR_FORMAT_ERR: { errno: 304, msg: 'avatar圖檔格式錯誤，只接受JPG或PNG' },
        NO_HASH: { errno: 305, msg: '少了hash數據' },
        FORMIDABLE_ERR: { errno: 306, msg: 'formidable 解析發生錯誤' },
        UPDATE_GCE_ERR: { errno: 307, msg: 'upload file to GCS 發生錯誤' }
    },
    FORMAT_ERR: { errno: 601 },


    COMMENT: {
        CREATE_ERR: { errno: 1103, msg: 'COMMENT 創建失敗' },
        NOT_EXIST: { errno: 1102, msg: '評論不存在' },
        REMOVE_ERR: { errno: 1101, msg: '文章刪除失敗' }
    },

    PUB_SUB: {
        REMOVE_ERR: { errno: 1101, msg: 'PUB_SUB 刪除失敗' }
    },
    FOLLOWCOMMENT: {
        UPDATE_ERR: { errno: 1401, msg: 'FollowComment更新失敗' }
    },

    SERVER_ERR: { errno: 9999, msg: '伺服器錯誤' }
}