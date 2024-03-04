const Img = require("../server/img");
const Opts = require("../utils/seq_findOpts");
const { SuccModel, ErrModel, ErrRes } = require("../model");

async function add({ hash, url }) {
  let data = await Img.create({ hash, url });
  return new SuccModel({ data });
}
async function find(hash) {
  let data = await Img.read(Opts.IMG.FIND.one(hash));
  if (!data) {
    return new ErrModel(ErrRes.IMG.FIND.NO_DATA);
  }
  return new SuccModel({ data });
}

module.exports = {
  add,
  find,
};
