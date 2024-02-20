const READ = {
  SHOULD_NOT_EXIST: { errno: 50003, msg: "出現不該存在的 MsgReceiver" },
};

const UPDATE = {
  ERR: { errno: 801, msg: "更新 MsgReceiver 失敗" },
};

module.exports = {
  UPDATE,
  READ,
};
