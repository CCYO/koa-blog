/**
 * @description Controller news相關
 */
const moment = require("moment");
const C_User = require("../controller/user");
const C_Blog = require("../controller/blog");
const C_Comment = require("../controller/comment");
const News = require("../server/news");
const {
  DEFAULT: { QUERY_NEWS },
} = require("../config");
const { MyErr, SuccModel } = require("../model");

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
  let { list, num } = await News.readList({ user_id, excepts });
  list = await _findThroughData(list);
  let data = { news: { list, num } };
  return new SuccModel({ data });
}

module.exports = {
  readMore,
};

async function _findThroughData(newsList) {
  let list = await Promise.all(newsList.map(_findNews));
  //  分為 讀過/未讀過
  let res = list.reduce(
    (acc, news) => {
      if (news.confirm) {
        acc.confirm.push(news);
      } else {
        acc.unconfirm.push(news);
      }
      return acc;
    },
    { unconfirm: [], confirm: [] }
  );
  return res;

  async function _findNews(news) {
    let { type, id, target_id, follow_id, confirm, createdAt } = news;
    //  序列化時間數據
    let timestamp = moment(createdAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow();
    //  結果的預設值
    let res = { type, id, timestamp, confirm };
    if (type === QUERY_NEWS.TYPE.IDOL_FANS) {
      let resModel = await C_User.find(follow_id);
      if (resModel.errno) {
        throw new MyErr({ ...resModel, error: `user/${follow_id} 不存在` });
      }
      return { ...res, fans: resModel.data };
    } else if (type === QUERY_NEWS.TYPE.ARTICLE_READER) {
      let resModel = await C_Blog.findItemForNews(target_id);
      if (resModel.errno) {
        throw new MyErr({ ...resModel, error: `blog/${target_id} 不存在` });
      }
      return { ...res, blog: resModel.data };
    } else if (type === QUERY_NEWS.TYPE.MSG_RECEIVER) {
      let resModel = await C_Comment.findInfoForNews(target_id);
      if (resModel.errno) {
        throw new MyErr({ ...resModel, error: `comment/${target_id} 不存在` });
      }
      return { ...res, comment: resModel.data };
    }
  }
}
