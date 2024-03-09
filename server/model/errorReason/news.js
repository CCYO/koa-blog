const READ = {
  NOT_EXIST: { errno: 123, msg: "此通知已失效" },
  NO_LOGIN: { errno: 10000000001, msg: "尚未登入" },
};

module.exports = {
  READ,
};
