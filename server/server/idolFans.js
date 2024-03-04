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

async function restore(opts) {
  let x = await IdolFans.restore(opts);
  return x;
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
  restore,
};
