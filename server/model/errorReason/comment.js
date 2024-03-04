const CREATE = {
  ERR: { errno: 10123, msg: "COMMENT 創建失敗" },
};

const READ = {
  NOT_EXIST: { errno: 50003, msg: "不存在任何相符的 Comment" },
};

const REMOVE = {
  ERR: { errno: 801, msg: "刪除 comment 失敗" },
  ROW: { errno: 40003, msg: "刪除 COMMENT 的條目數量不如預期" },
  ERR_NO_PERMISSION: { errno: 801, msg: "沒有刪除權限" },
};

module.exports = {
  REMOVE,
  READ,
  CREATE,
};
