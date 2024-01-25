const { BlogImg, BlogImgAlt } = require("../db/mysql/model"); //  0406
const { ErrRes, MyErr } = require("../model"); //  0406
const Init = require("../utils/init"); //  0406
async function readList(opts) {
  let list = await BlogImg.findAll(opts);
  return Init.blogImg(list);
}

//  -----------------------------------------------------------------------------------------------
async function create(data) {
  try {
    let blogImg = await BlogImg.create(data);
    return Init.blogImg(blogImg);
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG.CREATE.ERR, error });
  }
}
async function countBlogImgAlt(blogImg_id) {
  let blogImg = await BlogImg.findByPk(blogImg_id);
  let count = await blogImg.countBlogImgAlts();
  return count;
}
async function destoryList(opts) {
  try {
    let row = await BlogImg.destroy(opts);
    return row;
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG.REMOVE.ERR, error });
  }
}
module.exports = {
  destoryList,
  countBlogImgAlt,
  create,
  //  --------------------------------------------------------------------------------------------
  readList,
  //  0408

  updateBlogImg,
  updateBulkBlogImg,
};

async function updateBlogImg(data) {
  let ins = await BlogImg.bulkCreate(data, {
    updateOnDuplicate: ["id", "name", "updatedAt"],
  });
  if (ins.length !== data.length) {
    return [];
  }
  Init.blogImgins;
  return true;
  let where = { id };
  let [row] = await BlogImg.update(data, { where });
  if (!row) {
    return false;
  }
  return true;
}

async function updateBulkBlogImg(dataList) {
  let promiseList = [];
  dataList.reduce(async (initVal, { id, data }) => {
    initVal.push(await updateBlogImg({ id, data }));
    return initVal;
  }, promiseList);

  let res = (await Promise.all(promiseList)).every((boo) => boo);

  if (!res) {
    return false;
  }

  return true;
}
