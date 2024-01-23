const Init = require("../utils/init");
//  0406
const { ErrRes, MyErr } = require("../model");
//  0406
const { ArticleReader } = require("../db/mysql/model"); //  0406
//  0514
async function readList(opts) {
  let datas = await ArticleReader.findAll(opts);
  return Init.articleReader(datas);
}
//  0423
async function updateList(datas, updateOnDuplicate) {
  try {
    let list = await ArticleReader.bulkCreate(datas, { updateOnDuplicate });
    return Init.articleReader(list);
  } catch (err) {
    throw new MyErr({ ...ErrRes.ARTICLE_READER.UPDATE.ERR, err });
  }
}
//  0406
// async function createList(datas) {
//     try {
//         let updateOnDuplicate = ['id', 'article_id', 'reader_id', 'createdAt', 'updatedAt', 'confirm']
//         let list = await ArticleReader.bulkCreate(datas, { updateOnDuplicate })
//         if (datas.length !== list.length) {
//             return new MyErr(ErrRes.ARTICLE_READER.CREATE.ROW)
//         }
//         return list.map(item => item.toJSON())
//     } catch (err) {
//         return new MyErr({ ...ErrRes.ARTICLE_READER.CREATE.ERR, err })
//     }
// }
//  0406

//  0406
// async function restore(opts) {
//     let res = await ArticleReader.restore(opts)
//     return res
// }
//  ----------------------------------------------------------------------
async function restoring(id) {
  try {
    let articleReader = await ArticleReader.findByPk(id, { paranoid: false });
    //  RV ArticleReader Model instance
    return await articleReader.restore();
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
module.exports = {
  deleteList,
  restoring,
  //  ----------------------------------------------------
  readList,
  updateList,
  count,
  hiddenBlog,
  readFollowers,
};

async function count(opts) {
  let num = await FollowBlog.count(opts);
  return num;
}

async function readFollowers(opts) {
  let followers = await ArticleReader.findAll(opts);
  return followers.map((follower) => follower.toJSON());
}

async function hiddenBlog({ where }) {
  // let { blog_id, confirm } = opts
  let opts = { where };
  let row = await ArticleReader.destroy(opts);
  if (!row) {
    return false;
  }
  return true;
}
