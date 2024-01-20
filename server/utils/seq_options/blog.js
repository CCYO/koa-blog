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
};

module.exports = {
  FIND,
};
