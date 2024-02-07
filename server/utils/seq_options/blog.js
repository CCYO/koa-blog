const { Op } = require("sequelize");
const { Img, BlogImg, BlogImgAlt, User } = require("../../db/mysql/model");

const FIND = {
  permission: (id, paranoid) => ({
    where: { id },
    attributes: ["id", "author_id"],
    paranoid,
  }),
  wholeInfo: (id, paranoid) => ({
    paranoid,
    attributes: ["id", "title", "html", "show", "showAt", "updatedAt"],
    where: { id },
    include: [
      {
        association: "author",
        attributes: ["id", "email", "nickname"],
      },
      {
        model: BlogImg,
        attributes: ["id", "name"],
        include: [
          {
            model: Img,
            attributes: ["id", "url", "hash"],
          },
          {
            model: BlogImgAlt,
            attributes: ["id", "alt"],
          },
        ],
      },
      {
        association: "replys",
        attributes: [
          "id",
          "html",
          "commenter_id",
          "pid",
          "createdAt",
          "deletedAt",
        ],
        include: {
          association: "commenter",
          attributes: ["id", "email", "nickname"],
        },
      },
    ],
    order: [["replys", "id"]],
  }),
  //  尋找作者粉絲以及blog_id的軟刪除reader
  fansAndDestoryedReaderList: (id) => ({
    where: { id },
    attributes: ["id"],
    include: [
      {
        association: "author",
        // model: User,
        // as: "author",
        attributes: ["id"],
        include: {
          model: User,
          as: "fansList",
          attributes: ["id"],
          through: {
            attributes: [],
          },
        },
      },
      {
        association: "readers",
        attributes: ["id"],
        through: {
          attributes: ["id"],
          where: {
            deletedAt: { [Op.ne]: null },
          },
          paranoid: false, //  無視軟刪除
        },
      },
    ],
  }),
  readerList: (id) => ({
    where: { id },
    attributes: ["id"],
    include: {
      association: "readers",
      attributes: ["id"],
      through: {
        attributes: [],
      },
    },
  }),
  listOfSquare: (id) => {
    let res = {
      attributes: ["id", "title", "show", "showAt"],
      where: {
        show: true,
      },
      include: {
        association: "author",
        attributes: ["id", "email", "nickname"],
      },
    };
    if (id) {
      res.where.author_id = { [Op.ne]: id };
    }
    return res;
  },
  listOfHaveImg: (author_id) => ({
    where: { author_id },
    attributes: ["id", "title", "show", "showAt", "updatedAt", "createdAt"],
    include: {
      model: BlogImg,
      attributes: [],
      required: true,
    },
  }),
  album: (id) => ({
    where: { id },
    attributes: ["id", "title"],
    include: [
      {
        model: BlogImg,
        attributes: ["id", "name"],
        include: [
          {
            model: Img,
            attributes: ["id", "url"],
          },
          {
            model: BlogImgAlt,
            attributes: ["id", "alt"],
          },
        ],
      },
    ],
  }),
};

const REMOVE = {
  list: (id_list) => ({
    where: {
      id: { [Op.in]: id_list },
    },
  }),
};
module.exports = {
  REMOVE,
  FIND,
};
