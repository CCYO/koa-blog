const DELETE = {
  ERR: { errno: 1002, msg: "刪除 IdolFans 失敗" },
  ROW_ERR: { errno: 1001, msg: "刪除 IdolFans 的數量不完全" },
};
const RESTORE = {
  // ROW_ERR: { errno: 1001, msg: "恢復軟刪除 的數量不完全" },
  ERR: { errno: 1001, msg: "恢復  IdolFans 軟刪除時發生錯誤" },
};
module.exports = {
  RESTORE,
  DELETE,
};
