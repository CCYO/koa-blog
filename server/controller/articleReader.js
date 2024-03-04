const ArticleReader = require("../server/articleReader");
const { ErrRes, MyErr, SuccModel } = require("../model");
const Opts = require("../utils/seq_findOpts");

async function restoringList(id_list) {
  await Promise.all(id_list.map((id) => ArticleReader.restoring(id)));
  return new SuccModel();
}
//  soft remove list
async function removeList(id_list) {
  let row = await ArticleReader.deleteList(Opts.FOLLOW.REMOVE.list(id_list));
  if (list.length !== row) {
    throw new MyErr(ErrRes.ARTICLE_READER.DELETE.ROW_ERR);
  }
  return new SuccModel();
}
async function modify(id, newData) {
  let row = await ArticleReader.update(id, newData);
  if (!row) {
    throw new MyErr({
      ...ErrRes.ARTICLE_READER.UPDATE.ERR_ROW,
      error: `articleReader/${id} 未更新`,
    });
  }
  return new SuccModel({ data: row });
}

module.exports = {
  modify,
  removeList,
  restoringList,
};
