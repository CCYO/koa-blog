const REMOVE = {
  ERR: { errno: 1002, msg: "刪除 IdolFans 失敗" },
  ROW_ERR: { errno: 1001, msg: "刪除 IdolFans 的數量不完全" },
};
const RESTORE = {
  ROW_ERR: { errno: 1001, msg: "恢復軟刪除 的數量不完全" },
};
const UPDATE = {
  ERR: { errno: 123, msg: "更新 IdolFans 失敗" },
  ERR_ROW: { errno: 802, msg: "IdolFans 更新條數不如預期" },
};
module.exports = {
  UPDATE,
  RESTORE,
  REMOVE,
};
