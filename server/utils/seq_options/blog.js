const { Img, BlogImg, BlogImgAlt, User } = require("../../db/mysql/model");

const FIND = {
  wholeInfo: (id) => ({
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
        attributes: ["id", "deletedAt"],
        paranoid: false, //  無視軟刪除
      },
    ],
  }),
  readerList: (id) => ({
    where: { id },
    attributes: ["id"],
    include: {
      association: "readers",
      attributes: ["id"],
    },
  }),
  //  廣場頁
  allOfPublicList: () => ({
    attributes: ["id", "title", "show", "showAt", "createdAt"],
    where: {
      show: true,
    },
    include: {
      association: "author",
      attributes: ["id", "email", "nickname"],
    },
  }),
};

module.exports = {
  FIND,
};
