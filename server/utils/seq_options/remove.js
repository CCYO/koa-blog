const { Op } = require("sequelize");
const one = (id) => ({ where: { id } });
const list = (id_list, force = false) => ({
  where: { id: { [Op.in]: id_list } },
  force,
});

module.exports = {
  one,
  list,
};
