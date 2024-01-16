const { Op } = require("sequelize");

const REMOVE = {
  list: (id_list) => ({
    where: { id: { [Op.in]: id_list } },
  }),
};

module.exports = {
  REMOVE,
};
