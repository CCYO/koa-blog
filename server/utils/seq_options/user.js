const { Op } = require("sequelize");
const { Blog } = require("../../db/mysql/model");
const { hash } = require("../crypto");

const CREATE = {
  one: ({ email, password }) => ({
    email,
    password: hash(password),
  }),
};

const FIND = {
  infoForCancelFollow: ({ idol_id, fans_id }) => ({
    attributes: ["id"],
    where: { id: fans_id },
    include: [
      {
        association: "idols",
        attributes: ["id"],
        where: { id: idol_id },
        required: false, //  找不到也顯示 []
        through: {
          //  idolFans Table
          attributes: ["id"],
        },
      },
      {
        association: "articles",
        attributes: ["id"],
        where: {
          author_id: idol_id, //  idol 的文章
        },
        required: false, //  找不到也顯示 []
        through: {
          //  articalReader Table
          attributes: ["id"],
          paranoid: false, //  無視軟刪除
        },
      },
    ],
  }),
  infoForFollowIdol: ({ idol_id, fans_id }) => ({
    attributes: ["id"],
    where: { id: fans_id },
    include: [
      {
        association: "idols",
        attributes: ["id"],
        where: { id: idol_id },
        required: false, //  找不到也顯示 []
        through: {
          //  idolFans Table
          attributes: ["id"],
          paranoid: false, //  無視軟刪除
        },
      },
      {
        association: "articles",
        attributes: ["id"],
        where: {
          author_id: idol_id, //  idol 的文章
          show: true, //  顯示狀態
        },
        required: false, //  找不到也顯示 []
        through: {
          //  articalReader Table
          attributes: ["id"],
          paranoid: false, //  無視軟刪除
        },
      },
    ],
  }),
  fansList: (idol_id) => ({
    attributes: ["id", "email", "nickname", "avatar"],
    include: {
      association: "idols",
      where: { id: idol_id },
      attributes: ["id"],
      through: {
        attributes: [],
      },
    },
  }),
  idolList: (fans_id) => ({
    attributes: ["id", "email", "nickname", "avatar"],
    include: {
      association: "fansList",
      where: { id: fans_id },
      through: {
        attributes: [],
      },
    },
  }),
  one: (id) => ({
    attributes: ["id", "email", "nickname", "age", "avatar", "avatar_hash"],
    where: { id },
  }),
  login: ({ email, password }) => ({
    attributes: ["id", "email", "nickname", "age", "avatar", "avatar_hash"],
    where: {
      email,
      password: hash(password),
    },
  }),
  email: (email) => ({
    attributes: ["id"],
    where: { email },
  }),
  blogList: (id) => ({
    where: { id },
    attributes: ["id"],
    include: {
      association: "blogs",
      attributes: ["id"],
    },
  }),
  _blogListHasCommented: (id) => ({
    where: { id },
    include: {
      association: "comments",
      attributes: ["id", "article_id"],
      include: {
        model: Blog,
        as: "article",
        attributes: ["id"],
        where: { author_id: { [Op.not]: id } },
      },
    },
  }),
  itemByIdolFans: ({ idol_id, idolFans_id }) => ({
    where: { id: idol_id },
    attributes: ["id"],
    include: {
      association: "fansList",
      attributes: ["id"],
      required: true,
      through: {
        where: { id: idolFans_id },
        attributes: ["id", "confirm"],
      },
    },
  }),
};

const UPDATE = {
  one: ({ user_id, newData }) => {
    let { password, ...data } = newData;
    if (newData.hasOwnProperty("password")) {
      data.password = hash(password);
    }
    return { id: user_id, ...data };
  },
};
module.exports = {
  UPDATE,
  FIND,
  CREATE,
};
