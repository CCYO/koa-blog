const { QueryTypes } = require("sequelize");
const { seq } = require("../db/mysql/model");
const {
  DEFAULT: { QUERY_NEWS },
} = require("../config");

async function readList({ user_id, excepts }) {
  if (!excepts) {
    excepts = { idolFans: [], articleReader: [], msgReceiver: [], total: 0 };
  }
  //  目前news總數，其中有無確認過的又各有多少
  //  num { unconfirm, confirm, total }
  let num = await _queryCount(user_id);
  let list = { confirm: [], unconfirm: [] };
  if (num.total && num.total !== excepts.total) {
    list = await _queryReadList({ user_id, excepts });
  }
  return { list, num };
}

module.exports = {
  readList,
};

async function _queryReadList({ user_id, excepts }) {
  /*
    {
        unconfirm: [
        { type, id, timestamp, confirm, fans: ... },
        { type, id, timestamp, confirm, blog: ... },
        { type, id, timestamp, confirm, comment: ... },
        ... ],
        confirm: [...] 
    }*/
  return await seq.query(genQuery(user_id, excepts), {
    type: QueryTypes.SELECT,
  });

  function genQuery(user_id, excepts) {
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
  
    ) AS table_dual
    ORDER BY confirm, createdAt DESC
    LIMIT ${QUERY_NEWS.LIMIT}
    `;
  }
}

async function _queryCount(user_id) {
  let [{ unconfirm, confirm, total }] = await seq.query(genQuery(user_id), {
    type: QueryTypes.SELECT,
  });
  return { unconfirm, confirm, total };

  function genQuery(user_id) {
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
              AND deletedAt IS NULL 
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
      ) AS table_dual
      `;
  }
}
