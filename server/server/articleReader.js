const { ErrRes, MyErr } = require("../model");
const { ArticleReader } = require("../db/mysql/model"); //  0406

async function restore(opts) {
  // RV ROW
  try {
    return await ArticleReader.restore(opts);
  } catch (error) {
    throw new MyErr({ ...ErrRes.ARTICLE_READER.RESTORE.ERR, error });
  }
}

async function deleteList(opts) {
  try {
    //  RV row
    return await ArticleReader.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ErrRes.ARTICLE_READER.DELETE.ERR, error });
  }
}
async function update(id, newData) {
  try {
    let [row] = await ArticleReader.update(newData, {
      where: { id },
    });
    return row;
  } catch (error) {
    throw new MyErr({ ...ErrRes.ARTICLE_READER.UPDATE.ERR, error });
  }
}
module.exports = {
  restore,
  update,
  deleteList,
};
