let {
  ARTICLE_READER,
  IDOL_FANS,
  SERVER,
  CACHE,
  NEWS,
  USER,
  BLOG,
  BLOG_IMG_ALT,
  BLOG_IMG,
  PAGE,
} = require("./errorReason");

module.exports = {
  PAGE: {
    ...PAGE,
    //  --------------------------------------------------------------------------
    // NOT_OWNER: { errno: 200002, msg: "非擁有者" },
    // NOT_SELF: { errno: 502, msg: "非本人" },
  },
  BLOG: {
    //  0411
    DELETE: {
      ERR: { errno: 801, msg: "刪除 BLOG 失敗" },
    },
    //  0411
    REMOVE: {
      //  0411
      NO_DATA: { errno: 30001, msg: "刪除 BLOG 卻沒提供查詢參數" },
      ERR: { errno: 706, msg: "刪除Blog失敗" },
    },
    UPLOAD_IMG_ERR: { errno: 704, msg: "Blog內文圖片上傳失敗" }, //  0326
    IMAGE_REMOVE_ERR: { errno: 705, msg: "刪除BlogImg時，數量對不上" },
    //  ---------------------------------------------------------------------------
    UPDATE: BLOG.UPDATE,
    REMOVE: BLOG.REMOVE,
    CREATE: BLOG.CREATE,
    READ: BLOG.READ,
  },
  BLOG_IMG: {
    READ: BLOG_IMG.READ,
    REMOVE: BLOG_IMG.REMOVE,
    //  ---------------------------------------------------------
    CREATE: {
      //  0406
      NO_DATA: { errno: 50002, msg: "創建 BLOG_IMG 卻沒提供參數" },
      //  0406
      ERR: { errno: 50001, msg: "BlogImg創建失敗" },
    },
    UPDATE_ERR: { errno: 802, msg: "更新失敗" },
    CREATE_ERR: { errno: 803, msg: "創建失敗" },
  },
  BLOG_IMG_ALT: {
    UPDATE: BLOG_IMG_ALT.UPDATE,
    REMOVE: BLOG_IMG_ALT.REMOVE,
    CREATE: BLOG_IMG_ALT.CREATE,
    READ: BLOG_IMG_ALT.READ,
    //  ----------------------------------------------------------------------------
    REMOVE_ERR: { errno: 903, msg: "BlogImgAlt刪除失敗" }, //  0326
  },
  //  0406
  ARTICLE_READER: {
    //  0423
    UPDATE: {
      //  0430
      ERR: { errno: 801, msg: "更新 ArticleReader 失敗" },
      //  0430
      CONFIRM: { errno: 1003, msg: "confirm articleReader 失敗" },
      //  0426
      ROW: { errno: 10004, msg: " ArticleReader 更新結果的數量不完全" },
    },
    //  0406
    CREATE: {
      NO_DATA: { errno: 50002, msg: "創建 ArticleReader 卻沒提供參數" },
      ROW: { errno: 40005, msg: "創建 ArticleReader 的數量不完全" },
      ERR: { errno: 40005, msg: "ArticleReader 創建失敗" },
    },
    //  0406
    RESTORE: {
      ...ARTICLE_READER.RESTORE,
    },
    //  0406
    DELETE: {
      ...ARTICLE_READER.DELETE,
    },
  },
  //  0406
  IDOL_FANS: {
    //  0406
    CREATE: {
      ROW: { errno: 40001, msg: "IdolFans 創建數量不完全" },
    },
    //  0423
    UPDATE: {
      //  0430
      CONFIRM: { errno: 1003, msg: "confirm IdolFans 失敗" },
      ERR: { errno: 801, msg: "更新 IdolFans 失敗" },
    },
    //  0406
    RESTORE: {
      ...IDOL_FANS.RESTORE,
    },
    //  0406
    REMOVE: {
      //  0406
      NO_IDOL: { errno: 40002, msg: "要刪除的 Idol 不存在" },
      ...IDOL_FANS.REMOVE,
    },
  },
  SERVER,
  CACHE: {
    UPDATE: {
      NO_DATA(type) {
        return { errno: 50002, msg: `更新 cache/${type} 卻沒提供參數` };
      },
    },
    READ: {
      NO_DATA(type) {
        return { errno: 50002, msg: `撈取 cache/${type} 卻沒提供參數` };
      },
    },
  },
  NEWS: {
    FOLLOW_CONFIRM_ERR: { errno: 1101, msg: "Follow.confirm 更新失敗" },
    BLOG_FANS_CONFIRM_ERR: { errno: 1102, msg: "Blog_Fans.confirm 更新失敗" },
    FOLLOW_COMMENT_CONFIRM_ERR: {
      errno: 1103,
      msg: "Blog_Fans.confirm 更新失敗",
    },
    READ: NEWS.READ,
  },
  USER: {
    PASSWORD_WRONG: { errno: 12004, msg: "原密碼錯誤" },
    UPDATE: USER.UPDATE,
    CREATE: USER.CREATE,
    READ: USER.READ,
  },
  //  -----------------------------------------------
  //  0527
  VALIDATE: {
    USER_ERRNO: 123456,
    //  0527
    USER(msg) {
      return { errno: ErrRes.VALIDATE.USER_ERRNO, msg };
    },
  },

  //  0411
  MSG_RECEIVER: {
    //  0414
    UPDATE: {
      //  0430
      ERR: { errno: 801, msg: "更新 MsgReceiver 失敗" },
      //  0430
      CONFIRM: { errno: 1003, msg: "confirm msgReceiver 失敗" },
      //  0414
      ROW: { errno: 1401, msg: "bulkCreate MsgReceiver 的數量不完全" },
    },
    //  0414
    DELETE: {
      //  0414
      ROW: { errno: 40003, msg: "刪除 MsgReceiver 的數量不完全" },
      //  0414
      ERR: { errno: 801, msg: "刪除 MsgReceiver 失敗" },
    },
    //  0411
    CREATE: {
      //  0411
      ROW: { errno: 40005, msg: "創建 MsgReceiver 的數量不完全" },
      //  0411
      NO_DATA: { errno: 50002, msg: "創建 MsgReceiver 卻沒提供參數" },
      //  0411
      ERR: { errno: 50001, msg: "MsgReceiver 創建失敗" },
    },
    READ: {
      //  0414
      SHOULD_NOT_EXIST: { errno: 50003, msg: "出現不該存在的 MsgReceiver" },
      //  0411
      NOT_EXIST: { errno: 50003, msg: "不存在任何相符的 MsgReceiver" },
    },
  },

  //  0411
  COMMENT: {
    //  0414
    DELETE: {
      //  0429
      NOT_DATA: { errno: 50002, msg: "刪除 COMMENT 卻沒提供參數" },
      //  0414
      ERR: { errno: 801, msg: "刪除 COMMENT 失敗" },
      ROW: { errno: 40003, msg: "刪除 BLOG 的數量不完全" },
    },
    READ: {
      //  0411
      NOT_EXIST: { errno: 50003, msg: "不存在任何相符的 Comment" },
    },
    CREATE_ERR: { errno: 1103, msg: "COMMENT 創建失敗" },
    NOT_EXIST: { errno: 1102, msg: "評論不存在" },
    REMOVE_ERR: { errno: 1101, msg: "文章刪除失敗" },
  },

  //  0406
  IMG: {
    //  0406
    CREATE: {
      //  0406
      ERR: { errno: 50001, msg: "IMG 創建失敗" },
    },
    NO_DATA: { errno: 40001, msg: "沒有相符的 IMG" },
  },
  //  0404

  READ: {
    NOT_EXIST: { errno: 201, msg: "沒有相符的使用者資料" },
  },
  UPDATE: {
    NO_DATA: { errno: 333, msg: "更新 User Data 卻沒提供數據" },
    INVALICATE: { errno: 301 },
    UNEXPECTED: { errno: 399 },
    VALICATE_ERR: { errno: 302 },
    NO_THIS_ONE: { errno: 303, msg: "沒有這個人" },
  },
  FORMAT_ERR: { errno: 601 },
  PUB_SUB: {
    REMOVE_ERR: { errno: 1101, msg: "PUB_SUB 刪除失敗" },
  },
};
