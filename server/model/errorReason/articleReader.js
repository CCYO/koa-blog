const DELETE = {
  ERR: { errno: 1002, msg: "刪除 ArticleReader 失敗" },
  ROW_ERR: { errno: 1001, msg: "刪除 ArticleReader 的數量不完全" },
};
module.exports = {
  DELETE,
};
