//  0430
const { SuccModel, ErrRes, MyErr } = require("../model");
//  0430
const {
  DEFAULT: { QUERY_NEWS },
} = require("../config");
/**
 * @description Controller news相關
 */
//  0426
const News = require("../server/news");

//  0430
async function confirm({ type, id }) {
  let row = await News.update(type, id, { confirm: true });
  if (row !== 1) {
    let TABLE = getTableName(type);
    throw new MyErr(ErrRes[TABLE].UPDATE.CONFIRM);
  }
  return new SuccModel();
  function getTableName(type) {
    switch (type) {
      case QUERY_NEWS.TYPE.IDOL_FANS:
        return "IDOL_FANS";
      case QUERY_NEWS.TYPE.ARTICLE_READER:
        return "ARTICLE_READER";
      case QUERY_NEWS.TYPE.MSG_RECEIVER:
        return "MSG_RECEIVER";
    }
  }
}
//  -------------------------------------------------------------------------------------------
async function readMore({ user_id, excepts }) {
  /*
    excepts: {
        idolFans: [ id, ... ],
        articleReader: [ id, ... ],
        msgReceiver: [ id, ...],
        total: NUMBER
    }
    
    news: {
        newsList: {
            unconfirm: [
                { type, id, timestamp, confirm, fans: ... },
                { type, id, timestamp, confirm, blog: ... },
                { type, id, timestamp, confirm, comment: ... },
            ... ],
            confirm: [...]
        },
        num: { unconfirm, confirm, total }
    }*/
  let news = await News.readList({ user_id, excepts });
  let data = { news };
  return new SuccModel({ data });
}

module.exports = {
  confirm,
  readMore,
};
