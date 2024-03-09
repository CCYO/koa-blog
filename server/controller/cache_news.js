const CacheNews = require("../server/cache_news");
const { SuccModel, ErrModel, ErrRes } = require("../model");

async function isExist(id) {
  let exist = await CacheNews.has(id);
  if (exist) {
    return new SuccModel();
  } else {
    return new ErrModel(ErrRes.CACHE.READ.NEWS_NOT_EXIST);
  }
}

async function removeList(id_list) {
  await CacheNews.destroyList(id_list);
  return new SuccModel();
}

async function addList(id_list) {
  await CacheNews.createList(id_list);
  return new SuccModel();
}

module.exports = {
  isExist,
  removeList,
  addList,
};
