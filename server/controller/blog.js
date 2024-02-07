const seq = require("../db/mysql/seq");
// async function findInfoForPageOfAlbumList(userId, { pagination } ) {
//     let blogs = await Blog.readList(Opts.BLOG.findInfoForPageOfAlbumList(userId))
//     let author = blogs.length ? blogs[0].author : undefined
//     let albums = Init.browser.blog.pageTable(blogs, { pagination })
//     let data = { author, albums }
//     return new SuccModel({ data })
// }

//  0406
async function public(blog_id) {
  let blog = await Blog.read(Opts.BLOG.findInfoForShow(blog_id));
  if (!blog) {
    throw new MyErr(ErrRes.BLOG.READ.NOT_EXIST);
  }
  let { author, readers, replys } = blog;
  let author_id = author.id;
  let fansList = new Set(author.fansList.map(({ id }) => id));
  let followers = [...fansList];
  let articleReaders = [];
  for (let { id: reader_id, ArticleReader } of readers) {
    if (fansList.has(reader_id)) {
      fansList.delete(reader_id);
      articleReaders.push({ ...ArticleReader, deletedAt: null });
    }
  }
  for (let reader_id of [...fansList]) {
    articleReaders.push({ reader_id, article_id: blog_id });
  }
  //  恢復軟刪除 + 新增
  if (articleReaders.length) {
    await C_ArticleReader.addList(articleReaders);
  }
  let msgReceivers = [];
  for (let reply of replys) {
    for (let { receiver_id, MsgReceiver } of reply.receivers) {
      followers.push(receiver_id);
      msgReceivers.push({ ...MsgReceiver, deletedAt: null });
    }
  }
  //  恢復軟刪除
  if (msgReceivers.length) {
    await C_MsgReceiver.addList(msgReceivers);
  }
  let data = { author_id, followers };
  return new SuccModel({ data });
}
//  0406
async function private(blog_id, forDelete = false) {
  let blog = await Blog.read(Opts.BLOG.findInfoForHidden(blog_id, forDelete));
  if (!blog) {
    throw new MyErr(ErrRes.BLOG.READ.NOT_EXIST);
  }
  let {
    author: { id: author_id },
    readers,
    replys,
  } = blog;
  let followers = [];
  let articleReaders = [];
  for (let { id: reader_id, ArticleReader } of readers) {
    followers.push(reader_id);
    articleReaders.push(ArticleReader);
  }
  //  軟刪除 articleReaders
  if (articleReaders.length) {
    await C_ArticleReader.removeList(articleReaders);
  }
  let msgReceivers = [];
  for (let reply of replys) {
    for (let { id: receiver_id, MsgReceiver } of reply.receivers) {
      followers.push(receiver_id);
      msgReceivers.push(MsgReceiver);
    }
  }
  //  軟刪除 msgReceivers
  if (msgReceivers.length) {
    await C_MsgReceiver.removeList(msgReceivers);
  }
  let data = {
    author_id,
    followers,
    replys: replys.map(({ id: reply_id }) => reply_id),
  };
  return new SuccModel({ data });
}

//  0404
async function find(blog_id) {
  if (!blog_id) {
    throw new MyErr(ErrRes.BLOG.READ.NO_DATA);
  }
  let data = await Blog.read(Opts.BLOG.find(blog_id));
  if (!data) {
    return new ErrModel(ErrRes.BLOG.READ.NOT_EXIST);
  }
  return new SuccModel({ data });
}

async function find_id_list_by_author_id(user_id) {
  let data = await Blog.readList(Opts.BLOG.find_id_List_by_author(user_id));
  return new SuccModel({ data });
}

const C_MsgReceiver = require("./msgReceiver"); //  0426
const C_Comment = require("./comment"); //  0425

const C_ArticleReader = require("./articleReader"); //  0406

const { MyErr, ErrRes, ErrModel, SuccModel } = require("../model"); //  0404
const Init = require("../utils/init"); //  0404

//  --------------------------------------------------------------------------------

const Opts = require("../utils/seq_findOpts"); //  0404
const Blog = require("../server/blog");
const my_xxs = require("../utils/xss");
const { ENV } = require("../config");
const {
  DEFAULT: { BLOG, CACHE },
} = require("../config");
const C_Img = require("./img");
const C_BlogImg = require("./blogImg");
const C_BlogImgAlt = require("./blogImgAlt");
/** 取得 blog 紀錄
 *
 * @param {number} blog_id blog id
 * @returns
 */
async function findWholeInfo({ author_id, blog_id }) {
  let data = await Blog.read(Opts.BLOG.FIND.wholeInfo(blog_id));
  if (!data) {
    return new ErrModel({
      ...ErrRes.BLOG.READ.NOT_EXIST,
      msg: `blog/${blog_id}不存在`,
    });
  }
  if (author_id && data.author.id !== author_id) {
    throw new MyErr(ErrRes.BLOG.READ.NOT_AUTHOR);
  }
  let opts = { data };
  return new SuccModel(opts);
}
/** 取得 blogList
 * @param {number} user_id user id
 * @param {boolean} is_author 是否作者本人
 * @returns {object} SuccessModel
 * {
 *  blogList {
 *      show: [
 *          blog {
 *              id, title, showAt,
 *              author: { id, email, nickname, age, avatar, avatar_hash }
 *          }, ...
 *      ],
 *      hidden: [ blog, ... ]
 *  }
 * }
 */
async function findListForUserPage(
  userId,
  opts = {
    public: { limit: BLOG.PAGINATION.BLOG_COUNT, offset: 0 },
    private: { limit: BLOG.PAGINATION.BLOG_COUNT, offset: 0 },
  }
) {
  let { data: public } = await _findPublicListForUserPage(userId, opts.public);
  let { data: private } = await _findPrivateListForUserPage(
    userId,
    opts.private
  );
  let data = { public, private };
  return new SuccModel({ data });
}
/** 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function add(title, author_id) {
  const data = await Blog.create({
    title: my_xxs(title),
    author_id,
  });
  const opts = { data };
  if (!ENV.isNoCache) {
    opts.cache = { [CACHE.TYPE.PAGE.USER]: [author_id] };
  }
  return new SuccModel(opts);
}
/** 更新 blog
 *
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modify({ blog_id, author_id, ...blog_data }) {
  // let { title, cancelImgs = [], html, show } = blog_data
  let map = new Map(Object.entries(blog_data));
  let cache = undefined;
  if (!ENV.isNoCache) {
    cache = {
      [CACHE.TYPE.PAGE.BLOG]: [blog_id],
    };
  }
  //  存放 blog 要更新的數據
  let newData = {};
  if (map.has("html")) {
    //  存放此次 blog 要更新的數據
    newData.html = my_xxs(blog_data.html);
  }
  //  更新 文章標題
  if (map.has("title")) {
    //  存放 blog 要更新的數據
    newData.title = my_xxs(blog_data.title);
  }

  // await seq.transaction(async (t) => {
  //  更新 文章公開狀態
  if (map.has("show")) {
    newData.show = map.get("show");
    if (newData.show) {
      newData.showAt = new Date();
      let { data: list } = await _addReaders(blog_id);
      if (cache && list.length) {
        cache[CACHE.TYPE.NEWS] = list;
      }
    } else {
      newData.showAt = null;
      await _destoryReaders(blog_id);
    }
  }
  if (cache && (map.has("title") || map.has("show"))) {
    cache[CACHE.TYPE.PAGE.USER] = [author_id];
  }
  if (map.has("html") || map.has("title") || map.has("show")) {
    //  更新文章
    await Blog.update(blog_id, newData);
  }
  //  刪除圖片
  if (map.has("cancelImgs")) {
    let cancelImgs = map.get("cancelImgs");
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    // await removeImgs(cancelImgs);
    await _removeImgList({ author_id, blog_id, cancelImgs });
  }
  await _checkPermission({ author_id, blog_id });
  let data = resModel.data;
  let opts = { data };
  if (cache) {
    opts.cache = cache;
  }
  return new SuccModel(opts);
}
async function addImg({ author_id, ...data }) {
  let { blog_id } = data;
  let alt_id = await _getAltId(data);
  let resModel = await C_BlogImgAlt.findWholeInfo({
    author_id,
    blog_id,
    alt_id,
  });
  // let  { blog_id, alt_id, alt, blogImg_id, name, img_id, url, hash } = resModel.data
  let opts = { data: resModel.data };
  if (!ENV.isNoCache) {
    opts.cache = { [CACHE.TYPE.PAGE.BLOG]: [blog_id] };
  }
  return new SuccModel(opts);

  async function _getAltId(data) {
    //  blog_id, hash, url  ->  固定參數
    //  blogImg_id          ->  直接加 blogImgAlt
    //  name, img_id    xx  ->  從加   img開始
    let { blog_id, img_id, url, hash, name, blogImg_id } = data;
    let map = new Map(Object.entries(data));
    if (map.get("blogImg_id")) {
      let {
        data: { id: alt_id },
      } = await C_BlogImgAlt.add(blogImg_id);
      return alt_id;
      //  data { blog_id, name, img_id }
    } else if (map.get("img_id")) {
      name = my_xxs(name);
      let {
        data: { id: blogImg_id },
      } = await C_BlogImg.add({ blog_id, name, img_id });
      return await _getAltId({ blogImg_id });
    } else {
      //  data { blog_id, hash, url, name, img_id }
      let {
        data: { id: img_id },
      } = await C_Img.add({ url, hash });
      return await _getAltId({ blog_id, img_id, name });
    }
  }
}
/** 刪除 blogs
 * @param {number} blog_id
 * @returns {object} SuccModel || ErrModel
 */
async function removeList({ blogList, author_id }) {
  if (!Array.isArray(blogList) || !blogList.length) {
    throw new MyErr(ErrRes.BLOG.REMOVE.NO_DATA);
  }
  await Promise.all(
    blogList.map((blog_id) => _checkPermission({ author_id, blog_id }))
  );
  await Promise.all(blogList.map(_destoryReaders));
  let row = await Blog.destroyList(Opts.BLOG.REMOVE.list(blogList));
  if (row !== blogList.length) {
    throw new MyErr(ErrRes.BLOG.REMOVE.ROW);
  }
  return new SuccModel();
}
//  廣場數據
async function findListOfSquare(author_id) {
  let list = await Blog.readList(Opts.BLOG.FIND.listOfSquare(author_id));
  let data = Init.browser.blog.sortAndInitTimeFormat(list);
  return new SuccModel({ data });
}

//  0421 因為使用 C_BLOG 會造成迴圈，故直接以USER做查詢
async function findAlbumList(author_id, pagination) {
  let blogs = await Blog.readList(Opts.BLOG.FIND.listOfHaveImg(author_id));
  if (!blogs.length) {
    return new ErrModel(ErrRes.BLOG.READ.NO_LIST);
  }
  await Promise.all(
    blogs.map((blog) => _checkPermission({ author_id, blog_id: blog.id }))
  );
  let albums = Init.browser.blog.pageTable(blogs, pagination);
  return new SuccModel({ data: { albums } });
}

async function findAlbum({ author_id, blog_id }) {
  let data = await Blog.read(Opts.BLOG.FIND.album(blog_id));
  await _checkPermission({ author_id, blog_id });
  if (data) {
    return new SuccModel({ data });
  } else {
    throw new ErrModel({
      ...ErrRes.BLOG.READ.NO_ALBUM,
      error: `blog/${blog_id} 沒有相片`,
    });
  }
}

module.exports = {
  findAlbum,
  findAlbumList,
  findListOfSquare,
  addImg,
  find,
  add,
  modify,
  findWholeInfo,
  //  ----------------------------------------------------
  find_id_list_by_author_id,

  //  0411
  // findInfoForPageOfAlbumList,
  //  0411
  removeList,
  findListForUserPage,
};
async function _removeImgList({ blog_id, cancelImgs }) {
  //  cancelImgs [ { blogImg_id, blogImgAlt_list: [alt_id, ...] }, ...]
  // try {
  //  確認blog_id是否真為author_id所有
  await Promise.all(cancelImgs.map(_removeImg));
  // let opts = undefined;
  // if (!ENV.isNoCache) {
  //   opts = { [CACHE.TYPE.PAGE.BLOG]: [blog_id] };
  // }
  // return new SuccModel(opts);
  return new SuccModel();
  async function _removeImg({ blogImg_id, blogImgAlt_list }) {
    //  找到blog內，指定的blogImgAlt有幾筆
    let resModel = await C_BlogImg.countBlogImgAlt(blogImg_id);
    if (resModel.errno) {
      throw new MyErr(resModel);
    }
    if (resModel.data === blogImgAlt_list.length) {
      ////  代表要刪除整筆 blogImg
      await C_BlogImg.removeList([blogImg_id]);
    } else {
      ////  代表要刪除個別 blogImgAlt
      await C_BlogImgAlt.removeList(blogImgAlt_list);
    }
    return true;
  }
}
async function _destoryReaders(blog_id) {
  let blog = await Blog.read(Opts.BLOG.FIND.readerList(blog_id));
  if (!blog) {
    throw new MyErr(ErrRes.BLOG.READ.NOT_EXIST);
  }
  let readers = blog.readers.map(({ id }) => id);
  if (readers.length) {
    await Blog.destoryReaders(blog_id, readers);
  }
  let data = { list: readers };
  return new SuccModel({ data });
}
async function _addReaders(blog_id) {
  let blog = await Blog.read(
    Opts.BLOG.FIND.fansAndDestoryedReaderList(blog_id)
  );
  if (!blog) {
    throw new MyErr(ErrRes.BLOG.READ.NOT_EXIST);
  }
  let { readers, articleReaders } = blog.readers.reduce(
    (acc, reader) => {
      acc.readers.push(reader.id);
      acc.articleReaders.push(reader.ArticleReader.id);
      return acc;
    },
    { readers: [], articleReaders: [] }
  );
  let fansList = blog.author.fansList
    .filter(({ id }) => {
      return !readers.some((reader_id) => reader_id === id);
    })
    .map(({ id }) => id);

  if (articleReaders.length) {
    await C_ArticleReader.restoringList(articleReaders);
  }
  if (fansList.length) {
    await Blog.createReaders(blog_id, fansList);
  }
  let data = [...fansList, ...readers];
  return new SuccModel({ data });
}
async function _findPublicListForUserPage(
  userId,
  opts = { limit: BLOG.PAGINATION.BLOG_COUNT, offset: 0 }
) {
  let data = await Blog.readListAndCountAll(
    Opts.BLOG.findPublicBlogForUserPage(userId, opts)
  );
  // let data = Init.browser.blog.pageTable(blogs, options)
  return new SuccModel({ data });
}
async function _findPrivateListForUserPage(
  userId,
  opts = { limit: BLOG.PAGINATION.BLOG_COUNT, offset: 0 }
) {
  let data = await Blog.readListAndCountAll(
    Opts.BLOG.findPrivateBlogForUserPage(userId, opts)
  );
  // let data = Init.browser.blog.pageTable(blogs, options)
  return new SuccModel({ data });
}

async function _checkPermission({ author_id, blog_id, paranoid = true }) {
  let data = await Blog.read(Opts.BLOG.FIND.wholeInfo(blog_id, paranoid));
  if (!data) {
    throw new MyErr({
      ...ErrRes.BLOG.READ.NOT_EXIST,
      msg: `blog/${blog_id}不存在`,
    });
  }
  if (data.author.id !== author_id) {
    throw new MyErr(ErrRes.BLOG.READ.NOT_AUTHOR);
  }
  let opts = { data };
  return new SuccModel(opts);
}
