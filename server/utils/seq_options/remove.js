const { Op } = require("sequelize");
const one = (id) => ({ where: { id } });
const list = (id_list) => ({
  where: { id: { [Op.in]: id_list } },
});

module.exports = {
  one,
  list,
};
