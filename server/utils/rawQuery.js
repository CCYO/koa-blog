const { MyErr } = require("../model");
const C_Comment = require("../controller/comment");
const C_Blog = require("../controller/blog");
const C_User = require("../controller/user");
const moment = require("moment");
const { QueryTypes } = require("sequelize");
const { seq } = require("../db/mysql/model");
const {
  DEFAULT: { QUERY_NEWS },
} = require("../config");

async function countNewsTotalAndUnconfirm({ user_id, options }) {
  let { markTime, fromFront } = options;

  let select = !fromFront
    ? `SELECT COUNT(if(confirm < 1, true, null))`
    : `SELECT COUNT(if(DATE_FORMAT('${markTime}', '%Y-%m-%d %T') < DATE_FORMAT(createdAt, '%Y-%m-%d %T'), true, null)) `;

  let query = `
    ${select} as numOfUnconfirm, COUNT(*) as total
    FROM (
        SELECT 1 as type, id, confirm, createdAt
        FROM FollowPeople
        WHERE
            idol_id=${user_id} 

        UNION

        SELECT 2 as type, id, confirm, createdAt
        FROM FollowBlogs
        WHERE 
            follower_id=${user_id}
            AND deletedAt IS NULL 

        UNION

        SELECT 3 as type, id, confirm, updatedAt
        FROM FollowComments
        WHERE
            follower_id=${user_id}
    ) AS X
    `;
  let [{ numOfUnconfirm, total }] = await seq.query(query, {
    type: QueryTypes.SELECT,
  });

  return { numOfUnconfirm, total };
}

//  ---------------------------------------------------------------------------------------
async function readNews({ user_id, excepts }) {
  let query = _queryString.newsList(user_id, excepts);
  /*
    {
        unconfirm: [
        { type, id, timestamp, confirm, fans: ... },
        { type, id, timestamp, confirm, blog: ... },
        { type, id, timestamp, confirm, comment: ... },
        ... ],
        confirm: [...] 
    }*/
  let newsList = await seq.query(query, { type: QueryTypes.SELECT });
  return await _initNews(newsList);
}

async function count(user_id) {
  let query = _queryString.count(user_id);
  let [{ unconfirm, confirm, total }] = await seq.query(query, {
    type: QueryTypes.SELECT,
  });
  return { unconfirm, confirm, total };
}

module.exports = {
  countNewsTotalAndUnconfirm,
  //  --------------------------------------------------------------------------------------------
  count,
  readNews,
};

function _newsList(user_id, excepts) {
  let list = { idolFans: "", articleReader: "", msgReceiver: "" };

  for (key in list) {
    list[key] =
      (excepts[key].length && ` AND id NOT IN (${excepts[key].join(",")})`) ||
      "";
  }
  return `
  SELECT type, id, target_id, follow_id, confirm, createdAt
  FROM (
      SELECT ${QUERY_NEWS.TYPE.IDOL_FANS} as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt
      FROM IdolFans
      WHERE 
          idol_id=${user_id}
          ${list.idolFans}

      UNION

      SELECT ${QUERY_NEWS.TYPE.ARTICLE_READER} as type, id, article_id as target_id, reader_id as follow_id, confirm, createdAt 
      FROM ArticleReaders
      WHERE 
          reader_id=${user_id}
          AND deletedAt IS NULL
          ${list.articleReader}

      UNION

      SELECT ${QUERY_NEWS.TYPE.MSG_RECEIVER} as type, id, msg_id as target_id, receiver_id as follow_id, confirm, createdAt 
      FROM MsgReceivers
      WHERE 
          receiver_id=${user_id}
          AND deletedAt IS NULL
          ${list.msgReceiver}

  ) AS X
  ORDER BY confirm=1, createdAt DESC
  LIMIT ${QUERY_NEWS.LIMIT}
  `;
}
function _count(user_id) {
  return `
    SELECT
        COUNT(if(confirm < 1, true, null)) as unconfirm, 
        COUNT(if(confirm = 1, true, null)) as confirm, 
        COUNT(*) as total
    FROM (
        SELECT ${QUERY_NEWS.TYPE.IDOL_FANS} as type, id, confirm
        FROM IdolFans
        WHERE
            idol_id=${user_id} 
        UNION

        SELECT ${QUERY_NEWS.TYPE.ARTICLE_READER} as type, id, confirm
        FROM ArticleReaders
        WHERE 
            reader_id=${user_id}
            AND deletedAt IS NULL 
        UNION

        SELECT ${QUERY_NEWS.TYPE.MSG_RECEIVER} as type, id, confirm
        FROM MsgReceivers
        WHERE
            receiver_id=${user_id}
            AND deletedAt IS NULL 
    ) AS X
    `;
}
const _queryString = {
  count: _count,
  newsList: _newsList,
};

// ----------------------------------------------------------------------------------------
async function _initNews(newsList) {
  let list = await Promise.all(newsList.map(findNews));
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
  //  0404
  async function findNews(news) {
    let { type, id, target_id, follow_id, confirm, createdAt } = news;
    //  序列化時間數據
    let timestamp = moment(createdAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow();
    //  結果的預設值
    let res = { type, id, timestamp, confirm };
    if (type === QUERY_NEWS.TYPE.IDOL_FANS) {
      let resModel = await C_User.find(follow_id);
      if (resModel.errno) {
        throw new MyErr(resModel);
      }
      return { ...res, fans: resModel.data };
    } else if (type === QUERY_NEWS.TYPE.ARTICLE_READER) {
      let resModel = await C_Blog.find(target_id);
      if (resModel.errno) {
        throw new MyErr(resModel);
      }
      return { ...res, blog: resModel.data };
    } else if (type === QUERY_NEWS.TYPE.MSG_RECEIVER) {
      let { data: comment } = await C_Comment.findInfoForNews(target_id);
      return { ...res, comment };
    }
  }
}
