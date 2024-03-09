const { getCache } = require("../db/redis");

async function destroyList(type, id_list) {
  let page = getCache(type);
  return await page.del(id_list);
}
async function read(type, id) {
  let page = getCache(type);
  let exist = await page.has(id);
  if (!exist) {
    return null;
  }
  return await page.get(id);
}
async function update(type, id, data) {
  let page = getCache(type);
  return await page.set(id, data);
}

module.exports = {
  read,
  update,
  destroyList,
};
