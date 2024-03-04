const { Comment } = require("../db/mysql/model");
const { ErrRes, MyErr } = require("../model");
const Init = require("../utils/init");

async function read(opts) {
  let comment = await Comment.findOne(opts);
  return Init.comment(comment);
}
async function readList(opts) {
  let comments = await Comment.findAll(opts);
  return Init.comment(comments);
}
async function create(data) {
  try {
    let comment = await Comment.create(data);
    return Init.comment(comment);
  } catch (error) {
    throw new MyErr({ ...ErrRes.COMMENT.CREATE.ERR, error });
  }
}
async function deleteList(opts) {
  try {
    //  RV row
    return await Comment.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ErrRes.COMMENT.DELETE.ERR, error });
  }
}
module.exports = {
  deleteList,
  create,
  readList,
  read,
};
