const CREATE = {
  ERR: { errno: 50001, msg: "IMG 創建失敗" },
};
const FIND = {
  NO_DATA: { errno: 40001, msg: "沒有相符的 IMG" },
};
module.exports = {
  FIND,
  CREATE,
};
