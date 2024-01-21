const CREATE = {
  ERR: { errno: 10004, msg: "BLOG 創建失敗" },
};
//  --------------------------------------------------------
const READ = {
  NOT_AUTHOR: { errno: 1005, msg: "非作者本人" },
  NOT_EXIST: { errno: 1005, msg: "該文章不存在" },
};

module.exports = {
  CREATE,
  READ,
  //    ----------------------------------------------------
};
