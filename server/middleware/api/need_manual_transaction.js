const { seq } = require("../../db/mysql/model");
const kv_pairs = [
  //  刪除comment，controller裡面必須 manual commit，才能取得 deletedAt。
  // { method: "DELETE", path: "/api/comment" },
  { method: "PATCH", path: "/api/blog" },
];

exports.need_manual_transaction = async function (ctx, next) {
  let need = kv_pairs.some((kv) => {
    let entries = Object.entries(kv);
    return entries.every(([k, v]) => ctx[k] === v);
  });
  //  判斷是否是用 manual transaction
  if (need) {
    await next();
  } else {
    await seq.transaction(async (t) => {
      await next();
    });
  }
};
