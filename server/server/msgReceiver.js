const Init = require("../utils/init");
//  0411
const { ErrRes, MyErr } = require("../model");
//  0411
const { MsgReceiver } = require("../db/mysql/model");

//  0414
async function updateList(newDatas) {
  try {
    let updateOnDuplicate = [
      "id",
      "msg_id",
      "receiver_id",
      "confirm",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ];
    //  注意，無論要更新的資料是否被 updateOnDuplicate 標示，RV 顯示的數據皆會符合newDatas
    //  但實際上DB內的數據有沒有被更新，還是要看有沒有被 updateOnDuplicate 標示
    let list = await MsgReceiver.bulkCreate(newDatas, { updateOnDuplicate });
    list = Init.msgReceiver(list);
    return list;
    // return Init.msgReceiver(list);
  } catch (error) {
    throw new MyErr({ ...ErrRes.MSG_RECEIVER.UPDATE.ERR, error });
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

//  -----------------------------------------------------------------------------
async function update(id, newData) {
  try {
    let [row] = await MsgReceiver.update(newData, { where: { id } });
    return row;
  } catch (error) {
    throw new MyErr({ ...ErrRes.MSG_RECEIVER.UPDATE.ERR, error });
  }
}
module.exports = {
  update,
  //  ----------------------------------------------------------------------------
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
