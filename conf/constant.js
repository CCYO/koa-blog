/**
 * @description 設定項的常數
 */

module.exports = {
    USER: {
        AVATAR: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    NEWS: {
        LIMIT: 2
    },
    BLOG: {
        PRIVATE: 'hidden',  //  0303
        PUBLIC: 'show',     //  0303
        PAGINATION: 5,      //  0303
        TIME_FORMAT: 'YYYY/MM/DD HH:mm:ss', //  0303
        SORT_BY: {'hidden': 'createdAt', 'show': 'showAt'}  //  0303
    },
    GCS_ref: {
        BLOG: 'blogImg',
        AVATAR: 'avatar'
    },
    CACHE: {
        TYPE: {
            NEWS: 'newNews',
            PAGE: {
                USER: 'userPage',
                BLOG: 'blogPage',
            },
            API: {
                COMMENT: 'blogPageComment'
            }
        },
        HAS_FRESH_CACHE: 0,
        NO_CACHE: 1,
        NO_IF_NONE_MATCH: 2, // 請求未攜帶 if-none-match
        IF_NONE_MATCH_IS_NO_FRESH: 3,   //  請求 if-none-match 已過期


    },
    REDIS_CONF: {
        SESSION_KEY: 'session_key'
    }
}