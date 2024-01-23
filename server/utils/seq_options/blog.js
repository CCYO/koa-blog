const {} = require("sequelize");
const { Img, BlogImg, BlogImgAlt } = require("../../db/mysql/model");

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
        attributes: [["id", "blogImg_id"], "name"],
        include: [
          {
            model: Img,
            attributes: [["id", "img_id"], "url", "hash"],
          },
          {
            model: BlogImgAlt,
            attributes: [["id", "alt_id"], "alt"],
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
        attributes: ["id"],
        include: {
          association: "fans",
          attributes: ["id"],
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
    attributes: [id],
    include: {
      association: "readers",
      attributes: ["id"],
    },
  }),
};

module.exports = {
  FIND,
};
