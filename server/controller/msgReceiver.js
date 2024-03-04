const MsgReceiver = require("../server/msgReceiver");
const { MyErr, SuccModel, ErrRes } = require("../model");
const Opts = require("../utils/seq_findOpts");

async function addList(datas) {
  let list = await MsgReceiver.updateList(datas);
  if (list.length !== datas.length) {
    throw new MyErr(ErrRes.MSG_RECEIVER.CREATE.ROW);
  }
  return new SuccModel({ data: list });
}
async function forceRemoveList(list) {
  let row = await MsgReceiver.deleteList(Opts.FOLLOW.REMOVE.listByForce(list));
  if (list.length !== row) {
    throw new MyErr({
      ...ErrRes.MSG_RECEIVER.REMOVE.ERR_ROW,
      error: `要刪除的list為 ${list}`,
    });
  }
  return new SuccModel();
}
async function modify(id, newData) {
  let row = await MsgReceiver.update(id, newData);
  if (!row) {
    throw new MyErr({
      ...ErrRes.MSG_RECEIVER.UPDATE.ERR_ROW,
      error: `msgReceiver/${id} 未更新`,
    });
  }
  return new SuccModel();
}
module.exports = {
  modify,
  forceRemoveList,
  addList,
};
