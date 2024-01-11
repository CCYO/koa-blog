const { hash } = require("../crypto");

const FIND = {
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
