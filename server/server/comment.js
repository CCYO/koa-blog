const { ErrRes, MyErr } = require("../model"); //  0411
const xss = require("xss"); //  0411
const Init = require("../utils/init"); //  0404
const {
  //  0404
  Comment,
  FollowComment,
} = require("../db/mysql/model");
//  0414
async function deleteList(opts) {
  try {
    //  RV row
    return await Comment.destroy(opts);
  } catch (err) {
    throw new MyErr({ ...ErrRes.COMMENT.DELETE.ERR, err });
  }
}

//  0411
async function readList(opts) {
  let comments = await Comment.findAll(opts);
  return Init.comment(comments);
}
//  0404
async function read(opts) {
  let comment = await Comment.findOne(opts);
  return Init.comment(comment);
}

//  --------------------------------------------------------------------------------
async function create({ commenter_id, article_id, html, pid }) {
  try {
    let data = {
      html: xss(html),
      article_id,
      commenter_id,
      pid: !pid ? null : pid,
    };
    let comment = await Comment.create(data);
    return Init.comment(comment);
  } catch (error) {
    throw new MyErr({ ...ErrRes.COMMENT.CREATE.ERR, error });
  }
}
module.exports = {
  create,
  //  ---------------------------------------------------------------
  deleteList,
  //  0411
  readList,
  //  0404
  read,
};
