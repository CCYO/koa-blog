const Opts = require("../utils/seq_findOpts");
const Blog = require("../server/blog");
const C_Img = require("./img");
const C_BlogImg = require("./blogImg");
const C_BlogImgAlt = require("./blogImgAlt");
const C_ArticleReader = require("./articleReader");
const Init = require("../utils/init");
const { MyErr, ErrRes, ErrModel, SuccModel } = require("../model");
const {
  ENV,
  DEFAULT: { BLOG, CACHE },
} = require("../config");
//  查詢 blog 分頁列表數據
async function findListForPagination({
  currentUser,
  author_id,
  show,
  limit = BLOG.PAGINATION.BLOG_COUNT,
  offset,
}) {
  let resModel;
  if (!show) {
    if (!currentUser || currentUser.id !== author_id) {
      throw new MyErr(ErrRes.BLOG.READ.NO_PERMISSION);
    }
    resModel = await _findPrivateListForUserPage(author_id, {
      limit,
      offset,
    });
  } else {
    resModel = await _findPublicListForUserPage(author_id, {
      limit,
      offset,
    });
  }
  return resModel;
}
async function findInfoForPrivatePage({ cache, blog_id, author_id }) {
  let { exist, data } = cache;
  if (exist === CACHE.STATUS.NO_CACHE) {
    let resModel = await checkPermission({ blog_id, author_id });
    resModel.data.html = encodeURI(
      resModel.data.html ? resModel.data.html : ""
    );
    return resModel;
  } else {
    return new SuccModel({ data });
  }
}
async function findInfoForCommonPage({ cache, blog_id, user_id }) {
  let { exist, data } = cache;
  if (exist === CACHE.STATUS.NO_CACHE) {
    let resModel = await findInfoOfPublic({ blog_id, user_id });
    if (!resModel.errno) {
      resModel.data.html = encodeURI(
        resModel.data.html ? resModel.data.html : ""
      );
    }
    return resModel;
  } else {
    return new SuccModel({ data });
  }
}
/** 取得 blog 紀錄
 *
 * @param {number} blog_id blog id
 * @returns
 */
async function findInfoOfPublic({ blog_id, user_id }) {
  let data = await Blog.read(Opts.BLOG.FIND.wholeInfo(blog_id));
  if (!data || (!data.show && data.author.id !== user_id)) {
    return new ErrModel({
      ...ErrRes.BLOG.READ.NOT_EXIST,
      msg: `blog/${id}不存在`,
    });
  }
  return new SuccModel({ data });
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
  const data = await Blog.create(Opts.BLOG.CREATE.one({ title, author_id }));
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

  let go = false;
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
    go = true;
  }
  if (map.has("html")) {
    newData.html = map.get("html");
    go = true;
  }
  if (map.has("title")) {
    newData.title = map.get("title");
    go = true;
  }
  if (go) {
    //  更新文章
    await Blog.update(Opts.BLOG.UPDATE.one({ blog_id, newData }));
  }
  //  刪除圖片
  if (map.has("cancelImgs")) {
    let cancelImgs = map.get("cancelImgs");
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    await _removeImgList({ author_id, blog_id, cancelImgs });
  }
  let resModel = await checkPermission({ author_id, blog_id });
  let data = resModel.data;
  let opts = { data };

  if (cache) {
    if (map.has("title") || map.has("show")) {
      cache[CACHE.TYPE.PAGE.USER] = [author_id];
    }
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
    blogList.map((blog_id) => checkPermission({ author_id, blog_id }))
  );
  await Promise.all(blogList.map(_destoryReaders));
  let row = await Blog.destroyList(Opts.BLOG.REMOVE.list(blogList));
  if (row !== blogList.length) {
    throw new MyErr(ErrRes.BLOG.REMOVE.ROW);
  }
  let opts = {};
  if (!ENV.isNoCache) {
    opts.cache = { [CACHE.TYPE.PAGE.USER]: [author_id] };
  }
  return new SuccModel(opts);
}
//  廣場數據
async function findListOfSquare(author_id) {
  let blogs = await Blog.readList(Opts.BLOG.FIND.listOfSquare(author_id));
  blogs = Init.browser.blog.sortAndInitTimeFormat(blogs);
  return new SuccModel({ data: { blogs } });
}

async function findListForAlbumListPage(author_id) {
  let public = await Blog.readList(
    Opts.BLOG.FIND.listOfHaveImg(author_id, { show: true })
  );
  let private = await Blog.readList(
    Opts.BLOG.FIND.listOfHaveImg(author_id, { show: false })
  );
  let data = {
    public: {
      list: public,
      count: public.length,
    },
    private: {
      list: private,
      count: private.length,
    },
  };
  return new SuccModel({ data });
}
async function findAlbum({ author_id, blog_id }) {
  let resModel = await checkPermission({ author_id, blog_id });
  if (resModel.errno) {
    return resModel;
  }
  let data = await Blog.read(Opts.BLOG.FIND.album(blog_id));
  if (data) {
    return new SuccModel({ data });
  } else {
    return new ErrModel(ErrRes.BLOG.READ.NO_ALBUM);
  }
}
async function confirmNews({ reader_id, articleReader_id }) {
  let blog = await Blog.read(
    Opts.BLOG.FIND.itemByArticleReader({ reader_id, articleReader_id })
  );
  if (!blog) {
    //  article不存在
    //  譬如article已刪除或隱藏，但newsCache不會針對刪除做更新，故reader可能在session.news中取得已被刪除的articleReceiver_id
    let opts = ErrRes.NEWS.READ.NOT_EXIST;
    if (!ENV.isNoCache) {
      opts.cache = { [CACHE.TYPE.NEWS]: [reader_id] };
    }
    return new ErrModel(opts);
  }
  let { ArticleReader } = blog.readers[0];
  if (!ArticleReader.confirm) {
    //  更新 articleReader
    await C_ArticleReader.modify(articleReader_id, { confirm: true });
  }
  let url = `/blog/${blog.id}`;
  return new SuccModel({ data: { url } });
}
async function findItemForNews(blog_id) {
  if (!blog_id) {
    throw new MyErr(ErrRes.BLOG.READ.NO_DATA);
  }
  let data = await Blog.read(Opts.BLOG.FIND.itemForNews(blog_id));
  if (!data) {
    throw new MyErr({
      ...ErrRes.BLOG.READ.NOT_EXIST,
      error: `blog/${blog_id} 不存在`,
    });
  }
  return new SuccModel({ data });
}
module.exports = {
  confirmNews,
  findAlbum,
  findListForAlbumListPage,
  findListOfSquare,
  removeList,
  addImg,
  add,
  modify,
  findInfoForCommonPage,
  checkPermission,
  findInfoForPrivatePage,
  findListForUserPage,
  findListForPagination,
  findItemForNews,
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
      throw new MyErr({
        ...resModel,
        error: `blogImg/${blogImg_id} 不具備任何有關聯的 blogImgAlt`,
      });
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
    Opts.BLOG.FIND.publicBlogForUserPage(userId, opts)
  );
  return new SuccModel({ data });
}
async function _findPrivateListForUserPage(
  userId,
  opts = { limit: BLOG.PAGINATION.BLOG_COUNT, offset: 0 }
) {
  let data = await Blog.readListAndCountAll(
    Opts.BLOG.FIND.privateBlogForUserPage(userId, opts)
  );
  return new SuccModel({ data });
}
async function checkPermission({ author_id, blog_id }) {
  let data = await Blog.read(Opts.BLOG.FIND.wholeInfo(blog_id));
  if (!data) {
    throw new MyErr({
      ...ErrRes.BLOG.READ.NOT_EXIST,
      error: `blog/${blog_id}不存在`,
    });
  }
  if (data.author.id !== author_id) {
    throw new MyErr({
      ...ErrRes.BLOG.READ.NOT_AUTHOR,
      error: `user/${author_id} 不是 blog/${blog_id} 的作者`,
    });
  }
  let opts = { data };
  return new SuccModel(opts);
}
