//  0411
const { MyErr, SuccModel, ErrRes, ErrModel } = require("../model");
//  0411
const Opts = require("../utils/seq_findOpts");
//  0411
const MsgReceiver = require("../server/msgReceiver");

//  0423
async function confirm(id) {
  let row = await MsgReceiver.update(id, { confirm: true });
  if (row !== 1) {
    throw new MyErr(ErrRes.MSG_RECEIVER.UPDATE.CONFIRM);
  }
  return new SuccModel();
}
//  0426
async function removeList(datas) {
  let list = datas.map(({ id }) => id);
  let raw = await MsgReceiver.deleteList(Opts.FOLLOW.removeList(list));
  if (list.length !== raw) {
    throw new MyErr(ErrRes.MSG_RECEIVER.DELETE.ROW);
  }
  return new SuccModel();
}
//  0414
async function modifyList(datas) {
  let list = await MsgReceiver.updateList(datas);
  return new SuccModel({ data: list });
}
//  0414

//  0414
async function findList(msg_id) {
  let list = await MsgReceiver.readList(Opts.MSG_RECEIVER.findList(msg_id));
  if (!list) {
    return new ErrModel(ErrRes.MSG_RECEIVER.READ.NOT_EXIST);
  }
  return new SuccModel({ data: list });
}

//  0411
async function find(whereOps) {
  let data = await MsgReceiver.read(Opts.MSG_RECEIVER.find(whereOps));
  if (!data) {
    return new ErrModel(ErrRes.MSG_RECEIVER.READ.NOT_EXIST);
  }
  return new SuccModel(data);
}
//  -------------------------------------------------------------------------------
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
  return new SuccModel({ data: row });
}
module.exports = {
  modify,
  forceRemoveList,
  addList,
  //  ----------------------------------------
  removeList,
  //  0414
  modifyList,
  //  0414

  //  0414
  findList,
  //  0411

  //  0411
  find,
};
