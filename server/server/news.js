//  0430
const { ErrRes, MyErr } = require("../model");
//  0430
const { IdolFans, ArticleReader, MsgReceiver } = require("../db/mysql/model");
//  0430
const {
  DEFAULT: {
    NEWS: {
      TYPE: { IDOL_FANS, ARTICLE_READER, MSG_RECEIVER },
    },
  },
} = require("../config");
//  0423
const rawQuery = require("../db/mysql/query");
//  0430
async function update(type, id, newData) {
  let { table, name } = getTable(type);
  function getTable(type) {
    switch (type) {
      case IDOL_FANS:
        return { table: IdolFans, name: "IDOL_NAME" };
      case ARTICLE_READER:
        return { table: ArticleReader, name: "ARTICLE_READER" };
      case MSG_RECEIVER:
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
//  0423
async function readList({
  user_id,
  excepts = { idolFans: [], articleReader: [], msgReceiver: [] },
}) {
  //  尋找 news（撇除 excepts）
  let newsList = await rawQuery.readNews({ user_id, excepts });
  //   { num: { unconfirm, confirm, total } }
  //  目前news總數，其中有無確認過的又各有多少
  let { num } = await rawQuery.count(user_id);
  return { newsList, num };
}
module.exports = {
  //  0430
  update,
  //  0423
  readList,
};
