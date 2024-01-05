const SERVER = require("../server/config/default");
const PAGE = {
  REGISTER_LOGIN: {
    VIEW: {
      LOGIN: "/login",
    },
    API: {
      LOGIN: "/api/user",
      REGISTER: "/api/user/register",
      LOGIN_SUCCESS: "/self",
      REGISTER_SUCCESS: "/login",
    },
    MESSAGE: {
      LOGIN_SUCCESS: "登入成功",
      LOGIN_FAIL: "登入失敗，請重新嘗試",
      REGISTER_SUCCESS: "註冊成功，請嘗試登入",
      REGISTER_FAIL: "註冊失敗，請重新嘗試",
    },
    ID: {
      LOGIN_FORM: "login",
      REGISTER_FORM: "register",
    },
    NAME: {
      EMAIL: "email",
      PASSWORD: "password",
      PASSWORD_AGAIN: "password_again",
    },
  },
  USER: {
    API: {
      //  api
      FOLLOW: "/api/user/follow",
      CANCEL_FOLLOW: "/api/user/cancelFollow",
      CREATE_BLOG: "/api/blog",
      REMOVE_BLOGS: "/api/blog",
      GET_BLOG_LIST: "/api/blog/list",
      //  view
      EDIT_BLOG: "/blog/edit",
    },
    SELECTOR: {
      PAGE_NUM_LINK: ".pagination .pagination .page-link",
    },
    ID: {
      NEW_BLOG_TITLE: "new_blog_title",
      NEW_BLOG: "new_blog",
      FANS_LIST: "fansList",
      IDOL_LIST: "idolList",
      FOLLOW: "follow",
      CANCEL_FOLLOW: "cancelFollow",
    },
    DATASET: {
      KEY: {
        BLOG_STATUS: "status",
        PAGE_TURN: "turn",
        PAGE_NUM: "page",
        PAGINATION_NUM: "pagination",
        REMOVE_BLOG: "remove-blog",
        BLOG_ID: "blog-id",
        USER_ID: "user-id",
      },
      VALUE: {
        NEXT_PAGE: "next-page",
        PREVIOUS_PAGE: "previous-page",
        NEXT_PAGINATION: "next-pagination",
        PREVIOUS_PAGINATION: "previous-pagination",
        REMOVE_BLOG_ITEM: "item",
        REMOVE_BLOG_LIST: "list",
      },
    },
  },
  BLOG_EDIT: {
    API: {
      UPDATE_BLOG: "/api/blog",
      CREATE_IMG: "/api/blog/img",
      CREATE_IMG_ALT: "/api/blog/blogImgAlt",
      UPDATE_ALBUM: "/api/album",
    },
    ID: {
      EDITOR_CONTAINER: "editor-container",
      EDITOR_TOOLBAR_CONTAINER: "toolbar-container",
      TITLE: "title",
      STATUS: "status",
      UPDATE_TITLE: "update_title",
      UPDATE_BLOG: "update_blog",
      REMOVE_BLOG: "remove_blog",
      BLOG_HTML_STRING_COUNT: "content_count",
    },
    REG: {
      IMG_NAME_AND_EXT: /^(.+)\.(.+?)$/,
      IMG_ALT_ID: /alt_id=(?<alt_id>\w+)/,
      IMG_PARSE_TO_X_IMG:
        /<img.+?src=".+?alt_id=(?<alt_id>\d+?)"(.+?style="(?<style>.*?)")?(.*?)\/>/g,
    },
  },
  BLOG: {
    API: {
      CREATE_COMMENT: "/api/comment",
      REMOVE_COMMENT: "/api/comment",
    },
    CLASS: {
      BLOG_CONTENT: "editor-content-view",
      COMMENT_LIST: "comment-list",
      COMMENT_EDITOR_CONTAINER: "editor-container",
      COMMENT_LIST_CONTAINER: "comment-list-container",
      COMMENT_ITEM_CONTAINER: "comment-item-container",
      COMMENT_ITEM_CONTENT: "comment-item-content",
    },
    DATASET: {
      KEY: {
        COMMENT_ID: "comment_id",
        EDITOR_ID: "editor_id",
        REMOVE_COMMENT: "remove",
        PID: "pid",
      },
    },
    REG: {
      BLOG_CONTENT_TRIM: /(<p><br><\/p>)|(<p>[\s&nbsp;]+<\/p>)/g,
    },
  },
  ALBUM: {
    ID: {
      MODAL: "modal_album",
    },
    DATASET: {
      KEY: {
        ALT_ID: "alt_id",
      },
    },
  },
  SETTING: {
    API: {
      CHECK_PASSWORD: "/api/user/confirmPassword",
      SETTING: "/api/user",
    },
    AVATAR_URL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    ID: {
      MODAL_ORIGIN_PASSWORD: "modal_origin_password",
    },
    NAME: {
      ORIGIN_PASSWORD: "origin_password",
    },
    AVATAR: {
      MAX_SIZE: 1024 * 1024 * 1,
      EXT: ["JPG", "PNG"],
    },
    REG: {
      AVATAR_EXT: /\b.+\.(?<ext>\w+)\b/,
      AVATAR_data_url: /\bdata:.*;base64,(?<data_url>.*)/,
    },
  },
};
const PREFIX = "CONS";
const REG = {
  PREFIX,
  // REPLACE: /[-]{2}(CONS\.\S+?)[-]{2}/g,
  REPLACE: new RegExp(`[-]{2}(${PREFIX}\\.\\S+?)[-]{2}`, "g"),
  // IGNORE: /\<%(?!(-\s+include)|([=\-]?\s+.*?CONS\.))/g,
  IGNORE: new RegExp(
    `\\<%(?!(-\\s+include)|([=\\-]?\\s+.*?${PREFIX}\\.))`,
    "g"
  ),
};

module.exports = {
  SERVER,
  PAGE,
  REG,
};
