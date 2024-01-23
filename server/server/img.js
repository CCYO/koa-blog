//  0406
const { ErrRes, MyErr } = require("../model");
//  0406
const init = require("../utils/init");
//  0406
const { Img } = require("../db/mysql/model");
async function read(opts) {
  let img = await Img.findOne(opts);
  return init.img(img);
}
//  ------------------------------------------------------------------------------------
async function create(data) {
  try {
    let img = await Img.create(data);
    return init.img(img);
  } catch (error) {
    throw new MyErr({ ...ErrRes.IMG.CREATE.ERR, error });
  }
}
module.exports = {
  create,
  //  -----------------------------------------------------------------------------------
  read,
};
