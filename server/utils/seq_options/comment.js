const { Op } = require("sequelize");
const FIND = {
  _infoAboutItem: ({ article_id, pid }) => {
    //  找尋指定 blogId
    let where = { article_id };
    if (!pid) {
      ////  沒有pid，代表item是根評論，故要尋找的相關數據是與根評論(pid = null)有關的數據
      where.pid = null;
    } else {
      ////  有pid，代表要尋找的是子評論，故要尋找的相關數據是父評論(id = pid)以及兄弟評論(pid = pid)
      where[Op.or] = [{ id: pid }, { pid }];
    }
    return {
      attributes: ["id", "commenter_id"],
      where,
      include: {
        association: "receivers",
        attribute: ["id"],
      },
    };
  },
  _one: (id) => ({
    attributes: [
      "id",
      "html",
      "updatedAt",
      "createdAt",
      "deletedAt",
      "pid",
      "commenter_id",
    ],
    where: { id },
    include: {
      association: "commenter",
      attributes: ["id", "email", "nickname"],
    },
  }),
  _msgReceiverOfAuthor: ({ article_id, author_id }) => ({
    attributes: ["id"],
    where: { article_id },
    include: {
      association: "receivers",
      attributes: ["id"],
      where: { id: author_id },
    },
  }),
};

module.exports = {
  FIND,
};
