const CREATE = { errno: 10004, msg: "創建失敗" };
const READ = {
  //  0425
  NOT_FIRST_FOLLOW: { errno: 1007, msg: "非初次 follow" },
  NO_IDOL: { errno: 1006, msg: "找不到 idol" },
  NO_DATA: { errno: 1005, msg: "找不到此帳戶" },
  LOGIN_FAIL: { errno: 1004, msg: "登入失敗，帳號或密碼錯誤" },
  NO_PASSWORD: { errno: 1003, msg: "缺少密碼" },
  NO_EMAIL: { errno: 1002, msg: "缺少信箱" },
  EMAIL_EXIST: { errno: 1001, msg: "信箱已有人註冊" },
};

module.exports = {
  CREATE,
  READ,
};
