const { Op } = require("sequelize");
const RESTORY = {
  list: (id_list) => ({
    id: { [Op.in]: id_list },
  }),
};

module.exports = {
  RESTORY,
};
