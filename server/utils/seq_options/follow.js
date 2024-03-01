const { Op } = require("sequelize");

const REMOVE = {
  list: (id_list) => ({
    where: { id: { [Op.in]: id_list } },
  }),
  listByForce: (id_list) => ({
    where: { id: { [Op.in]: id_list } },
    force: true,
  }),
};

module.exports = {
  REMOVE,
};
