//   FOLLOW_CONFIRM_ERR: { errno: 1101, msg: "Follow.confirm 更新失敗" },
//   BLOG_FANS_CONFIRM_ERR: { errno: 1102, msg: "Blog_Fans.confirm 更新失敗" },
//   FOLLOW_COMMENT_CONFIRM_ERR: {
//     errno: 1103,
//     msg: "Blog_Fans.confirm 更新失敗",
//   },
const READ = {
  NO_LOGIN: { errno: 10000000001, msg: "尚未登入" },
  NOT_EXIST: { errno: 123, msg: "此通知已不存在" },
};

module.exports = {
  READ,
};
