/**
 * @description Server User
 */
const { ErrRes, MyErr } = require("../model");
const { User } = require("../db/mysql/model");
const Init = require("../utils/init");

//  更新user數據
async function update({ id, ...data }) {
  let [row] = await User.update(data, { where: { id } });
  if (!row) {
    throw new MyErr({
      ...ErrRes.USER.UPDATE.ERR,
      error: `blog/${id} 更新失敗`,
    });
  }
  return row;
}
/** 查找 User 資料
 * @param {{ id: number, email: string, password: string }} param0
 * @param {number} param0.id - user id
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @return {} 無資料為null，反之，password 以外的 user 資料
 */
async function read(opts) {
  let user = await User.findOne(opts);
  return Init.user(user);
}
/** 創建 User
 * @param {object} param0
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @returns {object} object 除了 password 以外的 user 資料
 */
async function create(data) {
  try {
    const user = await User.create(data);
    return Init.user(user);
  } catch (error) {
    throw MyErr({ ...ErrRes.USER.CREATE, error });
  }
}
async function createIdol({ idol_id, fans_id }) {
  let fans = await User.findByPk(fans_id);
  //  IdolFans Model instance
  return await fans.addIdol(idol_id);
}
async function readList(opts) {
  let users = await User.findAll(opts);
  return Init.user(users);
}

module.exports = {
  update,
  readList,
  createIdol,
  create,
  read,
};
