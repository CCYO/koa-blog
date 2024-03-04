const ArticleReader = require("../server/articleReader");
const { ErrRes, MyErr, SuccModel } = require("../model");
const Opts = require("../utils/seq_findOpts");

async function restoringList(id_list) {
  let row = await ArticleReader.restore(
    Opts.ARTICLE_READER.RESTORY.list(id_list)
  );
  if (id_list.length !== row) {
    throw new MyErr(ErrRes.ARTICLE_READER.RESTORE.ROW_ERR);
  }
  return new SuccModel();
}

//  soft remove list
async function removeList(id_list) {
  let row = await ArticleReader.deleteList(Opts.FOLLOW.REMOVE.list(id_list));
  if (id_list.length !== row) {
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
  return new SuccModel();
}

module.exports = {
  modify,
  removeList,
  restoringList,
};
