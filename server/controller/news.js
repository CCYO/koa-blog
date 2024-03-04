/**
 * @description Controller news相關
 */
const News = require("../server/news");
const { SuccModel } = require("../model");

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
  readMore,
};
