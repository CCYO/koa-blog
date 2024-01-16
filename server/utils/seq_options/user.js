const { hash } = require("../crypto");
//  0406

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
    attributes: ["id", "email", "nickname", "avatar"],
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
};
//  0404
const CREATE = {
  one: ({ email, password }) => ({
    email,
    password: hash(password),
  }),
};
module.exports = {
  //  0404
  FIND,
  CREATE,
};
