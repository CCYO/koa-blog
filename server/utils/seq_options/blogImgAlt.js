const { Blog, BlogImg, Img } = require("../../db/mysql/model");
const FIND = {
  wholeInfo: (alt_id) => ({
    where: { id: alt_id },
    attributes: [["id", "alt_id"], "alt"],
    include: {
      model: BlogImg,
      attributes: [["id", "blogImg_id"], "blog_id", "name"],
      required: true,
      include: [
        {
          model: Blog,
          attribute: ["id"],
        },
        {
          model: Img,
          attribute: [["id", "img_id"], "url", "hash"],
          required: true,
        },
      ],
    },
  }),
};

module.exports = {
  FIND,
};
