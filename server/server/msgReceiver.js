const Init = require("../utils/init");
//  0411
const { ErrRes, MyErr } = require("../model");
//  0411
const { MsgReceiver } = require("../db/mysql/model");
async function update(id, newData) {
  let [row] = await MsgReceiver.update(newData, { where: id });
  return row;
}
//  0414
async function updateList(datas, updateOnDuplicate, transaction = undefined) {
  try {
    let options = { updateOnDuplicate };
    if (transaction) {
      options.transaction = transaction;
    }
    let list = await MsgReceiver.bulkCreate(datas, options);
    return Init.msgReceiver(list);
  } catch (err) {
    throw new MyErr({ ...ErrRes.MSG_RECEIVER.UPDATE.ERR, err });
  }
}
//  0414
async function deleteList(opts) {
  try {
    let row = await MsgReceiver.destroy(opts);
    if (!row) {
      throw new MyErr(ErrRes.MSG_RECEIVER.DELETE.ROW);
    }
    return row;
  } catch (err) {
    throw new MyErr({ ...ErrRes.MSG_RECEIVER.DELETE.ERR, err });
  }
}
//  0414
async function readList(opts) {
  let list = MsgReceiver.findAll(opts);
  return Init.msgReceiver(list);
}
//  0411
async function bulkCreate(datas, opts) {
  try {
    let list = await MsgReceiver.bulkCreate(datas, opts);
    if (list.length !== datas.length) {
      throw new MyErr(ErrRes.MSG_RECEIVER.CREATE.ROW);
    }
    return Init.msgReceiver(list);
  } catch (err) {
    throw new MyErr({ ...ErrRes.MSG_RECEIVER.CREATE.ERR, err });
  }
}
//  0411
async function read(opts) {
  let list = await MsgReceiver.findOne(opts);
  return list.map((item) => item.toJSON());
}
module.exports = {
  //  0430
  update,
  //  0414
  updateList,
  //  0414
  deleteList,
  //  0414
  readList,
  //  0411
  bulkCreate,
  //  0411
  read,
};
