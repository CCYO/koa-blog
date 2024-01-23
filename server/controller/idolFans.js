const { SuccModel, ErrRes, MyErr } = require("../model"); //  0406
const {
  DEFAULT: {
    CACHE: {
      TYPE: { PAGE, NEWS },
    },
  },
} = require("../config"); //  0406
const IdolFans = require("../server/idolFans"); //  0406
const Opts = require("../utils/seq_findOpts"); //  0406
//  ------------------------------------------------
const S_ArticalReader = require("../server/articleReader");
//  0423
async function confirmList(datas) {
  let updatedAt = new Date();
  let newDatas = datas.map((data) => ({ ...data, updatedAt, confirm: true }));
  let list = await IdolFans.updateList(newDatas);
  if (list.length !== newDatas.length) {
    throw new MyErr(ErrRes.IDOL_FANS.UPDATE.CONFIRM);
  }
  return new SuccModel({ data: list });
}

//  0426
async function addList(datas) {
  let updateOnDuplicate = [
    "id",
    "idol_id",
    "fans_id",
    "confirm",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ];
  let list = await IdolFans.updateList(datas, updateOnDuplicate);
  if (list.length !== datas.length) {
    throw new MyErr(ErrRes.IDOL_FANS.CREATE.ROW);
  }
  return new SuccModel({ data: list });
}

//  --------------------------------------------------------------------------------------
async function restoringList(id_list) {
  await Promise.all(id_list.map((id) => IdolFans.restoring(id)));
  return new SuccModel();
}
async function removeList(id_list) {
  let row = await IdolFans.deleteList(Opts.REMOVE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ErrRes.IDOL_FANS.REMOVE.ROW_ERR);
  }
  return new SuccModel();
}

module.exports = {
  restoringList,
  removeList,
  //  ---------------------------------------------------------------------------
  confirmList,
};
