const CREATE = {
  ERR: { errno: 10123, msg: "COMMENT 創建失敗" },
};

const READ = {
  NOT_EXIST: { errno: 50003, msg: "不存在任何相符的 Comment" },
};

const REMOVE = {
  ERR_NO_PERMISSION: { errno: 801, msg: "沒有刪除權限" },
};

module.exports = {
  REMOVE,
  READ,
  CREATE,
};
