const { seq } = require("../../db/mysql/model");

module.exports = async function (ctx, next) {
  return seq.transaction(async (t) => {
    await next();
  });
};
