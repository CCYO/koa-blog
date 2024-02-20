const DELETE = {
  ERR: { errno: 1002, msg: "刪除 ArticleReader 失敗" },
  ROW_ERR: { errno: 1001, msg: "刪除 ArticleReader 的數量不完全" },
};
const RESTORE = {
  ERR: { errno: 1002, msg: "恢復 ArticleReader 軟刪除時發生錯誤" },
  // ROW: { errno: 40004, msg: "恢復軟刪除 ArticleReader 的數量不完全" },
};
const UPDATE = {
  ERR: { errno: 801, msg: "更新 ArticleReader 失敗" },
  ERR_ROW: { errno: 802, msg: "ArticleReader 更新條數不如預期" },
};
module.exports = {
  UPDATE,
  RESTORE,
  DELETE,
};
