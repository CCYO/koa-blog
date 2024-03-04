const { Img } = require("../db/mysql/model");
const { ErrRes, MyErr } = require("../model");
const init = require("../utils/init");

async function create(data) {
  try {
    let img = await Img.create(data);
    return init.img(img);
  } catch (error) {
    throw new MyErr({ ...ErrRes.IMG.CREATE.ERR, error });
  }
}
async function read(opts) {
  let img = await Img.findOne(opts);
  return init.img(img);
}

module.exports = {
  read,
  create,
};
