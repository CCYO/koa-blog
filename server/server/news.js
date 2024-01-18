//  0430
const { ErrRes, MyErr } = require("../model");
//  0430
const { IdolFans, ArticleReader, MsgReceiver } = require("../db/mysql/model");
//  0430
const {
  DEFAULT: { QUERY_NEWS },
} = require("../config");
//  0423
const rawQuery = require("../utils/rawQuery");
//  0430
async function update(type, id, newData) {
  let { table, name } = getTable(type);
  function getTable(type) {
    switch (type) {
      case QUERY_NEWS.TYPE.IDOL_FANS:
        return { table: IdolFans, name: "IDOL_NAME" };
      case QUERY_NEWS.TYPE.ARTICLE_READER:
        return { table: ArticleReader, name: "ARTICLE_READER" };
      case QUERY_NEWS.TYPE.MSG_RECEIVER:
        return { table: MsgReceiver, name: "MSG_RECEIVER" };
    }
  }
  try {
    let [row] = await table.update(newData, { where: { id } });
    return row;
  } catch (err) {
    throw new MyErr({ ...ErrRes[name].UPDATE.ERR, err });
  }
}
//  ----------------------------------------------------------------------------------
async function readList({ user_id, excepts }) {
  if (!excepts) {
    excepts = { idolFans: [], articleReader: [], msgReceiver: [], total: 0 };
  }

  //   { num: { unconfirm, confirm, total } }
  //  目前news總數，其中有無確認過的又各有多少
  let num = await rawQuery.count(user_id);
  let list = { confirm: [], unconfirm: [] };
  if (num.total && num.total !== excepts.total) {
    //  尋找 news（撇除 excepts）
    list = await rawQuery.readNews({ user_id, excepts });
  }
  return { list, num };
}
module.exports = {
  //  0430
  update,
  //  ---------------------------------------------------------------------------------
  readList,
};
