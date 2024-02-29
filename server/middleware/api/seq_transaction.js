const { seq } = require("../../db/mysql/model");
//  sequelize transaction
module.exports = async function (ctx, next) {
  return seq.transaction(async (t) => {
    await next();
  });
};
