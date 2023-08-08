/**
 * @description 設定項的常數
 */

module.exports = {
    VALIDATE: {
        USER: {
            IS_EMAIL_EXIST: 'isEmailExist',
            REGISTER: 'register',
            LOGIN: 'login',
            SETTING: 'setting'
        }
    },
    USER: {
        //  0404
        AVATAR: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    NEWS: {
        LIMIT: 2,
        TYPE: {
            IDOL_FANS: 1,
            ARTICLE_READER: 2,
            MSG_RECEIVER: 3
        }
    },
    BLOG: {
        HTML_MAX_LENGTH: 65536,
        HTML_MIN_LENGTH: 1,
        PAGINATION: 5,      //  0303
        TIME_FORMAT: 'YYYY/MM/DD HH:mm:ss', //  0303
        ORGANIZED: {
            TARGET_PROP: 'show',
            TIME: {
                POSITIVE: 'showAt',
                NEGATIVE: 'updatedAt'
            },
            TYPE: {
                POSITIVE: 'show',
                NEGATIVE: 'hidden'
            }
        }
    },
    ALBUM: {
        PAGINATION: 10
    },
    COMMENT: {
        TIME_FORMAT: 'YYYY/MM/DD HH:mm:ss',
        SORT_BY: 'createdAt',
        CHECK_IS_DELETED: 'isDeleted'
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
        STATUS: {
            HAS_FRESH_CACHE: 0,
            NO_CACHE: 1,
            NO_IF_NONE_MATCH: 2, // 請求未攜帶 if-none-match
            IF_NONE_MATCH_IS_NO_FRESH: 3,   //  請求 if-none-match 已過期
        }
    },
    SESSION: {
        NEWS: (ctx) => ({
            errno: undefined,
            data: {
                news: {
                    newsList: {
                        confirm: [],
                        unconfirm: []
                    },
                    num: {
                        unconfirm: 0,
                        confirm: 0,
                        total: 0
                    }
                },
                me: ctx.session.user
            },
        })
    },
    REDIS_CONF: {
        SESSION_KEY: 'session_key'
    }
}