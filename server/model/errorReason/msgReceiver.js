const READ = {
  SHOULD_NOT_EXIST: { errno: 50003, msg: "出現不該存在的 MsgReceiver" },
};

const UPDATE = {
  ERR: { errno: 801, msg: "更新 MsgReceiver 失敗" },
  ERR_ROW: { errno: 802, msg: "MsgReceiver 更新條數不如預期" },
};

const REMOVE = {
  ERR: { errno: 801, msg: "刪除 MsgReceiver 失敗" },
  ERR_ROW: { errno: 802, msg: "MsgReceiver 刪除條數不如預期" },
};

module.exports = {
  REMOVE,
  UPDATE,
  READ,
};
