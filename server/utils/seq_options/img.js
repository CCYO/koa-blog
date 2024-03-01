const FIND = {
  one: (hash) => ({
    attributes: ["id", "url", "hash"],
    where: { hash },
  }),
};

module.exports = {
  FIND,
};
