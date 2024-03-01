const {
  BLOG,
  FOLLOW,
  USER,
  BLOG_IMG_ALT,
  REMOVE,
  COMMENT,
  IMG,
} = require("./seq_options");

//  0411
const { Op } = require("sequelize");
const { BlogImg, Comment } = require("../db/mysql/model");

module.exports = {
  IMG,
  COMMENT: {
    //  0514
    findArticlesOfCommented: (commenter_id) => ({
      attributes: ["id", "article_id"],
      where: {
        commenter_id,
      },
    }),
    //  0423

    //  0414
    _findLastItemOfPidAndNotSelf: (article_id, commenter_id, time, pid) => ({
      attributes: [
        "id",
        "html",
        "article_id",
        "commenter_id",
        "updatedAt",
        "createdAt",
        "deletedAt",
        "pid",
      ],
      where: {
        article_id,
        commenter_id: { [Op.not]: commenter_id },
        pid: pid ? pid : null,
        createdAt: { [Op.lte]: time },
      },
      order: [["createdAt", "DESC"]],
    }),
    //  0411

    findDeletedItem: (id) => ({
      attributes: [
        "id",
        "html",
        "updatedAt",
        "createdAt",
        "deletedAt",
        "pid",
        "commenter_id",
      ],
      where: {
        id,
        deletedAt: { [Op.not]: null },
      },
      paranoid: false,
      include: {
        association: "commenter",
        attributes: ["id", "email", "nickname"],
      },
    }),
    //  0411
    findInfoForPageOfBlog: (article_id) => {
      return {
        attributes: ["id", "html", "pid", "createdAt", "deletedAt"],
        where: { article_id },
        paranoid: false, //  包含已軟刪除的條目
        include: {
          association: "commenter",
          attributes: ["id", "email", "nickname"],
        },
      };
    },
    ...COMMENT,
  },
  REMOVE,
  BLOG_IMG_ALT: {
    ...BLOG_IMG_ALT,
  },
  BLOG: {
    ...BLOG,
    //  0427
    findInfoForModifyTitle: (blog_id) => ({
      where: { id: blog_id /*show: true*/ },
      attributes: ["id"],
      include: [
        {
          association: "author",
          attributes: ["id"],
          include: {
            association: "fansList",
            attributes: ["id"],
          },
        },
        {
          association: "readers",
          attributes: ["id"],
        },
        {
          association: "replys",
          attributes: ["id"],
          required: false,
          // where: {
          //     deletedAt: { [Op.not]: null }
          // },
          include: {
            association: "receivers",
            attributes: ["id"],
            through: {
              attributes: [],
            },
          },
        },
      ],
    }),
    //  0406
    findInfoForHidden: (article_id, forDelete) => {
      let where = { id: article_id };
      //  不作為刪除 blog 使用時，判斷條件需加入 show: true
      if (!forDelete) {
        where.show = true;
      }
      return {
        attributes: ["id"],
        where,
        include: [
          {
            association: "author",
            attributes: ["id"],
          },
          {
            association: "readers",
            attributes: ["id"],
            through: {
              attributes: ["id"],
            },
          },
          {
            association: "replys",
            attributes: ["id"],
            required: false,
            // where: {
            //     deletedAt: { [Op.not]: null }
            // },
            include: {
              association: "receivers",
              attributes: ["id"],
              through: {
                attributes: ["id"],
              },
            },
          },
        ],
      };
    },
    //  0406
    findInfoForShow: (article_id) => ({
      attributes: ["id"],
      where: { id: article_id },
      include: [
        {
          association: "readers",
          attributes: ["id"],
          //  ArticleReader
          through: {
            attributes: [
              "id",
              "article_id",
              "reader_id",
              "confirm",
              "createdAt",
              "deletedAt",
            ],
            paranoid: false,
          },
        },
        {
          association: "author",
          attributes: ["id"],
          include: {
            association: "fansList",
            attributes: ["id"],
          },
        },
        {
          association: "replys",
          required: false,
          // where: {
          //     deletedAt: { [Op.not]: null }
          // },
          attributes: ["id"],
          include: {
            association: "receivers",
            attributes: ["id"],
            //  MsgReceiver
            through: {
              attributes: [
                "id",
                "msg_id",
                "receiver_id",
                "confirm",
                "createdAt",
                "deletedAt",
              ],
            },
          },
        },
      ],
    }),
    //  0411
    findInfoForPageOfAlbumList: (author_id) => ({
      attributes: ["id", "title", "show", "showAt", "updatedAt", "createdAt"],
      where: { author_id },
      include: [
        {
          association: "author",
          attributes: ["id", "nickname", "email"],
          required: true,
        },
        {
          model: BlogImg,
          attributes: [],
          required: true,
        },
      ],
    }),
    find_id_List_by_author: (author_id) => ({
      attributes: ["id"],
      where: { author_id },
    }),
    //  0404
    findListForUserPage: (author_id, { limit = 5, offset = 0 }) => ({
      attributes: ["id", "title", "author_id", "show", "showAt", "updatedAt"],
      where: { author_id },
    }),
  },
  //  0406
  FOLLOW: {
    //  0414

    //  0406
    restoreList: (id_list) => ({
      where: { id: { [Op.in]: id_list } },
    }),
    //  -----------------------------------------------
    ...FOLLOW,
  },
  USER: {
    findArticleReaderByIdolFans: ({ idolId, fansId }) => ({
      attributes: ["id"],
      where: { id: idolId },
      include: {
        association: "fans",
        attributes: ["id"],
        where: {
          id: fansId,
        },
        through: {
          attributes: [],
          paranoid: false,
        },
        include: {
          attributes: ["id"],
          association: "FollowBlog_B",
          where: { user_id: idolId },
          through: {
            attributes: ["id"],
            paranoid: false,
          },
        },
      },
    }),
    ...USER,
  },
  //  -------------------------------------------------------------------------------------
  BLOG_IMG: {
    findInfoForRemoveBlog: (blog_id) => ({
      where: {
        blog_id,
      },
      attributes: ["id"],
    }),
  },
  ARTICLE_READER: {
    count: (blog_id) => ({
      where: { blog_id },
    }),
  },
  //  0411
  MSG_RECEIVER: {
    //  0414
    findList: (msg_id) => ({
      where: { msg_id },
    }),
    //  0411
    bulkCreate: (datas) => {
      let keys = [...Object.keys(datas)];
      return {
        updateOnDuplicate: [...keys],
      };
    },
    //  0411
    find: (whereOps) => ({
      attributes: [
        "id",
        "receiver_id",
        "msg_id",
        "confirm",
        "deletedAt",
        "createdAt",
      ],
      where: { ...whereOps },
    }),
  },

  //  0406

  //  0303
  findBlogFollowersByBlogId(blog_id) {
    return {
      attributes: ["follower_id"],
      where: { blog_id },
    };
  },
};
