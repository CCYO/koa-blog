const { Op, col, fn } = require("sequelize");
const { Img, BlogImg, BlogImgAlt, User } = require("../../db/mysql/model");
const my_xss = require("../xss");

const REMOVE = {
  list: (id_list) => ({
    where: {
      id: { [Op.in]: id_list },
    },
  }),
};

const FIND = {
  permission: (id, paranoid) => ({
    where: { id },
    attributes: ["id", "author_id"],
    paranoid,
  }),
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
        paranoid: false,
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
  publicBlogForUserPage: (author_id, opts) => ({
    attributes: ["id", "title", "author_id", "show", "showAt", "updatedAt"],
    where: {
      author_id,
      show: true,
    },
    limit: opts.limit,
    offset: opts.offset,
    order: [["showAt", "DESC"]],
  }),
  privateBlogForUserPage: (author_id, opts) => ({
    attributes: [
      "id",
      "title",
      "author_id",
      "show",
      "showAt",
      "updatedAt",
      "createdAt",
    ],
    where: {
      author_id,
      show: false,
    },
    limit: opts.limit,
    offset: opts.offset,
    order: [["createdAt", "DESC"]],
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
  listOfHaveImg: (author_id, opts) => {
    let res = {
      where: { author_id },
      attributes: ["id", "title", "show", "showAt", "updatedAt", "createdAt"],
      include: {
        model: BlogImg,
        attributes: [],
        required: true,
      },
      order: [["createdAt", "DESC"]],
    };
    if (opts.hasOwnProperty("show")) {
      res.where.show = opts.show;
      if (opts.show) {
        res.order = [["showAt", "DESC"]];
      }
    }
    return res;
  },
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
  itemByArticleReader: ({ reader_id, articleReader_id }) => ({
    attributes: ["id"],
    include: {
      association: "readers",
      attributes: ["id"],
      where: { id: reader_id },
      through: {
        attributes: ["id", "confirm"],
        where: { id: articleReader_id },
      },
    },
  }),
  itemForNews: (id) => ({
    attributes: ["id", "title", "show", "showAt"],
    where: { id },
    include: {
      association: "author",
      attributes: ["id", "email", "nickname"],
    },
  }),
};

const CREATE = {
  one: ({ title, author_id }) => ({
    title: my_xss(title),
    author_id,
  }),
};
const UPDATE = {
  one: ({ blog_id, newData }) => {
    let { html, title, ...data } = newData;
    if (newData.hasOwnProperty("html")) {
      data.password = my_xss(html);
    }
    if (newData.hasOwnProperty("title")) {
      data.title = my_xss(title);
    }
    return { id: blog_id, ...data };
  },
};
module.exports = {
  UPDATE,
  CREATE,
  REMOVE,
  FIND,
};
