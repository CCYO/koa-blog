const rawQuery = require("../utils/rawQuery");

async function readList({ user_id, excepts }) {
  if (!excepts) {
    excepts = { idolFans: [], articleReader: [], msgReceiver: [], total: 0 };
  }
  //  目前news總數，其中有無確認過的又各有多少
  //  num { unconfirm, confirm, total }
  let num = await rawQuery.count(user_id);
  let list = { confirm: [], unconfirm: [] };
  if (num.total && num.total !== excepts.total) {
    list = await rawQuery.readNews({ user_id, excepts });
  }
  return { list, num };
}

module.exports = {
  readList,
};
