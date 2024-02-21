const {
  //  0406
  ErrRes,
  //  0406
  MyErr,
  //  0406
  SuccModel,
} = require("../model");
const Opts = require("../utils/seq_findOpts"); //  0406
const ArticleReader = require("../server/articleReader"); //  0406
//  0423
async function confirmList(datas) {
  let updatedAt = new Date();
  let newDatas = datas.map((data) => ({ ...data, updatedAt, confirm: true }));
  let list = await ArticleReader.updateList(newDatas);
  if (list.length !== newsDatas.length) {
    throw new MyErr(ErrRes.ARTICLE_READER.UPDATE.CONFIRM);
  }
  return new SuccModel({ data: list });
}
//  0406
async function addList(datas) {
  if (!datas.length) {
    throw new MyErr(ErrRes.ARTICLE_READER.CREATE.NO_DATA);
  }
  let updateOnDuplicate = [
    "id",
    "article_id",
    "reader_id",
    "confirm",
    "updatedAt",
    "createdAt",
    "deletedAt",
  ];
  let list = await ArticleReader.updateList(datas, updateOnDuplicate);
  if (list.length !== datas.length) {
    throw new MyErr(ErrRes.ARTICLE_READER.CREATE.ROW);
  }
  return new SuccModel({ data: list });
}

//  0406
// async function restoreList(id_list){
//     let row = await ArticleReader.restore(Opts.FOLLOW.restoreList(id_list))
//     if(row !== id_list.length){
//         throw new MyErr(ErrRes.ARTICLE_READER.RESTORE.ROW)
//     }
//     return new SuccModel()
// }
//  ----------------------------------------------------------------------------------------------------
async function restoringList(id_list) {
  await Promise.all(id_list.map((id) => ArticleReader.restoring(id)));
  return new SuccModel();
}
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
  //  -------------------------------------
  //  0514
  // findReadersForModifiedUserData,
  //  0423
  confirmList,
  //  0406
  addList,
  //  0406
  count,
};

async function count(blog_id) {
  let data = await ArticleReader.count(Opts.PUB_SCR.count(blog_id));
  return new SuccModel({ data });
}
