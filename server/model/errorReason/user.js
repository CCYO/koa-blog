const CREATE = { errno: 10004, msg: "創建失敗" };
const READ = {
  NOT_FIRST_FOLLOW: { errno: 1007, msg: "非初次 follow" },
  NO_IDOL: { errno: 1006, msg: "找不到 idol" },
  NO_DATA: { errno: 1005, msg: "找不到此帳戶" },
  LOGIN_FAIL: { errno: 1004, msg: "登入失敗，帳號或密碼錯誤" },
  NO_PASSWORD: { errno: 1003, msg: "缺少密碼" },
  NO_EMAIL: { errno: 1002, msg: "缺少信箱" },
  EMAIL_EXIST: { errno: 1001, msg: "信箱已有人註冊" },
};
const UPDATE = {
  AVATAR_NO_ARGS_EXT: { errno: 305, msg: "少了ext數據" },
  AVATAR_NO_ARGS_HASH: { errno: 305, msg: "少了hash數據" },
  SAME_AVATAR_HASH: { errno: 1001, msg: "avatar hash相同，應該是同一圖檔" },
  AVATAR_FORMAT_ERR: {
    errno: 1001,
    msg: "avatar圖檔格式錯誤，只接受JPG或PNG",
  },
  FORMIDABLE_ERR: { errno: 306, msg: "formidable 解析發生錯誤" },
  NO_ARGS_DATA: { errno: 333, msg: "更新 User Data 卻沒提供任何數據" },
  GCE_ERR: { errno: 307, msg: "上傳圖片給GFB時， 發生錯誤" },
  ORIGIN_PASSWORD_ERR: { errno: 308, msg: "舊密碼不符合" },
  ERR: { errno: 30004, msg: "USER資料更新失敗" },
};

module.exports = {
  UPDATE,
  CREATE,
  READ,
};
