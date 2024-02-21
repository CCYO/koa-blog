/**
 * @description Server IdolFans
 */
const Init = require("../utils/init");
const { IdolFans } = require("../db/mysql/model"); //  0406
const {
  //  0406
  MyErr,
  ErrRes,
} = require("../model");

//  0423
async function updateList(datas, updateOnDuplicate) {
  try {
    let list = await IdolFans.bulkCreate(datas, { updateOnDuplicate });
    return Init.idolFans(list);
  } catch (err) {
    throw new MyErr({ ...ErrRes.IDOL_FANS.UPDATE.ERR, err });
  }
}

//  -------------------------------
async function restoring(id) {
  try {
    let idolFans = await IdolFans.findByPk(id, { paranoid: false });
    //  RV IdolFans Model instance
    return await idolFans.restore();
  } catch (error) {
    throw new MyErr({ ...ErrRes.IDOL_FANS.RESTORE.ERR, error });
  }
}
async function deleteList(opts) {
  try {
    //  RV row
    return await IdolFans.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ErrRes.IDOL_FANS.DELETE.ERR, error });
  }
}
async function update(id, newData) {
  try {
    let [row] = await IdolFans.update(newData, {
      where: { id },
    });
    return row;
  } catch (error) {
    throw new MyErr({ ...ErrRes.IDOL_FANS.UPDATE.ERR, error });
  }
}
module.exports = {
  update,
  deleteList,
  restoring,
  //    -----------------------
  //  0423
  updateList,
};
