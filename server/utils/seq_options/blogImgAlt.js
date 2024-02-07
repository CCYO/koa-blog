const { Blog, BlogImg, Img } = require("../../db/mysql/model");
const FIND = {
  wholeInfo: (alt_id) => ({
    where: { id: alt_id },
    attributes: ["id", "alt"],
    include: {
      model: BlogImg,
      attributes: ["id", "name"],
      required: true,
      include: [
        {
          model: Blog,
          attributes: ["id", "author_id"],
          required: true,
        },
        {
          model: Img,
          attributes: ["id", "url", "hash"],
          required: true,
        },
      ],
    },
  }),
};

module.exports = {
  FIND,
};
