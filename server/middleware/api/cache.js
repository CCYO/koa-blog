//  0501
const S_Cache = require("../../server/cache");

//  處理 resModel.cache
async function modify(ctx, next) {
  await next();
  if (ctx.body.hasOwnProperty("cache")) {
    await S_Cache.modify(ctx.body.cache);
  }
  delete ctx.body.cache;
  return;
}

module.exports = {
  //  0504
  modify,
};
