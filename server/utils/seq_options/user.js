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
};

module.exports = {
  //  0404
  FIND,
};
