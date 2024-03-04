const IdolFans = require("../server/idolFans");
const { SuccModel, ErrRes, MyErr } = require("../model");
const Opts = require("../utils/seq_findOpts");

async function restoringList(id_list) {
  let row = await IdolFans.restore(Opts.IDOL_FANS.RESTORY.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ErrRes.IDOL_FANS.RESTORE.ROW_ERR);
  }
  return new SuccModel();
}

async function removeList(id_list) {
  let row = await IdolFans.deleteList(Opts.REMOVE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ErrRes.IDOL_FANS.REMOVE.ROW_ERR);
  }
  return new SuccModel();
}

async function modify(id, newData) {
  let row = await IdolFans.update(id, newData);
  if (!row) {
    throw new MyErr({
      ...ErrRes.IDOL_FANS.UPDATE.ERR_ROW,
      error: `idolFans/${id} 未更新`,
    });
  }
  return new SuccModel();
}

module.exports = {
  modify,
  restoringList,
  removeList,
};
