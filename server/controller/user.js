/**
 * @description Controller user相關
 */
const {
  BLOG: {
    ORGANIZED: {
      TYPE: { POSITIVE, NEGATIVE },
    },
  },
  CACHE: {
    TYPE: {
      API,
      PAGE, //  0228
      NEWS, //  0228
    },
  },
} = require("../conf/constant");
const C_MsgReceiver = require("./msgReceiver");
const C_Comment = require("./comment");
const C_ArticlReader = require("./articleReader");
const Init = require("../utils/init"); //  0421
const C_Blog = require("./blog"); //  0309
const { ErrRes, ErrModel, SuccModel, MyErr } = require("../model"); //  0404
const Opts = require("../utils/seq_findOpts"); //  0404
const User = require("../server/user"); //  0404

//  0514
//  更新user
async function modify({ _origin, ...newData }) {
  let { id: user_id } = _origin;
  let cache = undefined;
  if (process.env.NODE_ENV !== "nocache") {
    cache = {
      [PAGE.USER]: [user_id],
      [PAGE.BLOG]: [],
      [API.COMMENT]: [],
      [NEWS]: [],
    };
    if (newData.nickname || newData.email || newData.avatar) {
      ////  處理cache
      let {
        data: { fansList, idolList },
      } = await findRelationShip(user_id);

      //   let { data: {
      //     relationShip: { fansList, idolList },
      //     blogs,
      //   }
      // } = await findInfoForUserPage(user_id);
      //  找出 idolFans
      // let people = [...fansList, ...idols].map(({ id }) => id);
      let people = [...fansList, ...idolList].map(({ id }) => id);
      cache[PAGE.USER] = cache[PAGE.USER].concat(people);
      let { data: blogList } = await C_Blog.find_id_list_by_author_id(user_id);
      // let blogList = [];
      //  找出 自己的 blog
      // for (let isShow in blogs) {
      //   //  公開/隱藏的blog
      //   for (let pagination of blogs[isShow]) {
      //     //  分頁
      //     let blog_id_list = pagination.map(({ id }) => id);
      //     blogList = blogList.concat(blog_id_list);
      //   }
      // }
      cache[PAGE.BLOG] = cache[PAGE.BLOG].concat(blogList);
      //  找出 reader
      let { data: readers } =
        await C_ArticlReader.findReadersForModifiedUserData(blogList);
      cache[NEWS] = cache[NEWS].concat(readers);
      //  找出 評論 與 被評論的文章
      let {
        data: { articles, comments },
      } = await C_Comment.findArticlesOfCommented(user_id);
      cache[API.COMMENT] = cache[API.COMMENT].concat(articles);
      if (comments.length) {
        //  找出 receiver
        let { data: receivers } =
          await C_MsgReceiver.findListForModifiedUserData(comments);
        cache[NEWS] = cache[NEWS].concat(receivers);
      }
    }
  }
  //  測試舊密碼是否正確
  if (newData.hasOwnProperty("password")) {
    let { errno } = await login(_origin.email, newData.origin_password);
    if (errno) {
      return new ErrModel(ErrRes.USER.READ.PASSWORD_WRONG);
    }
  }
  let user = await User.update({ newData, id: user_id });
  return new SuccModel({ data: user, cache });
}
//  0421 因為使用 C_BLOG 會造成迴圈，故直接以USER做查詢
async function findAlbumListOfUser(user_id, pagination) {
  let res = await User.read(Opts.USER.findAlbumListOfUser(user_id));
  if (!res) {
    return ErrModel(ErrRes.USER.READ.NO_USER);
  }
  let { blogs, ...author } = res;
  let albums = Init.browser.blog.pageTable(blogs, pagination);
  return new SuccModel({ data: { albums, author } });
}
async function check_origin_password({ user_id, origin_password }) {
  await User.read(Opts.USER.login);
}
//  0406
async function findInfoForFollowIdol({ fans_id, idol_id }) {
  let user = await User.read(
    Opts.USER.findInfoForFollowIdol({ fans_id, idol_id })
  );
  if (!user) {
    throw new MyErr(ErrRes.USER.READ.NO_USER);
  }
  let { idols, articles } = user;
  if (!idols.length) {
    return new ErrModel(ErrRes.USER.READ.FIRST_FOLLOW);
  }
  let idolFans = idols[0].IdolFans;
  let articleReaders = articles.map(({ ArticleReader }) => ArticleReader);
  let data = { idolFans, articleReaders };
  return new SuccModel({ data });
}
//  0404
async function findInfoForUserPage(userId) {
  //  向 DB 撈取數據
  let resModel = await findRelationShip(userId);
  let {
    data: { currentUser, fansList, idolList },
  } = resModel;
  //  向 DB 撈取數據
  let { data: blogs } = await C_Blog.findListForUserPage(userId);
  // let data = { currentUser, fansList, idols, blogs }
  let data = { currentUser, relationShip: { fansList, idolList }, blogs };
  return new SuccModel({ data });
}
//  0404
async function findRelationShip(userId) {
  let userModel = await find(userId);
  if (userModel.errno) {
    throw new MyErr({ ...userModel });
  }
  let { data: currentUser } = userModel;
  let { data: idolList } = await _findIdols(userId);
  let { data: fansList } = await findFansList(userId);
  let data = { currentUser, idolList, fansList };
  return new SuccModel({ data });
}
//  0404
async function _findIdols(fans_id) {
  let data = await User.readList(Opts.USER.findIdols(fans_id));
  return new SuccModel({ data });
}
//  0404
async function findFansList(idol_id) {
  let data = await User.readList(Opts.USER.findFansList(idol_id));
  return new SuccModel({ data });
}
//  0404
async function find(id) {
  const data = await User.read(Opts.USER.find(id));
  if (!data) {
    return new ErrModel(ErrRes.USER.READ.NO_DATA);
  }
  return new SuccModel({ data });
}
//  0404
/** 登入 user
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns resModel
 */
async function login(email, password) {
  if (!email || !password) {
    return new ErrModel(ErrRes.USER.LOGIN.DATA_INCOMPLETE);
  }
  const data = await User.read(Opts.USER.login({ email, password }));
  if (!data) {
    return new ErrModel(ErrRes.USER.LOGIN.NO_USER);
  }
  return new SuccModel({ data });
}
//  0404
/** 註冊
 * @param {string} email - user 的信箱
 * @param {string} password - user 未加密的密碼
 * @returns {object} SuccessMode || ErrModel Instance
 */
async function register(email, password) {
  if (!password) {
    return new ErrModel(ErrRes.USER.REGISTER.NO_PASSWORD);
  } else if (!email) {
    return new ErrModel(ErrRes.USER.REGISTER.NO_EMAIL);
  }
  const resModel = await isEmailExist(email);
  if (resModel.errno) {
    return resModel;
  }
  const data = await User.create(Opts.USER.create({ email, password }));
  return new SuccModel({ data });
}
//  0404
/** 確認信箱是否已被註冊
 * @param {string} email 信箱
 * @returns {object} resModel
 */
async function isEmailExist(email) {
  const exist = await User.read(Opts.USER.isEmailExist(email));
  if (exist) {
    return new ErrModel(ErrRes.USER.REGISTER.IS_EXIST);
  }
  return new SuccModel();
}

module.exports = {
  //  0514
  modify,
  //  0421
  findAlbumListOfUser,
  //  0406
  findInfoForFollowIdol,
  //  0404
  findOthersInSomeBlogAndPid,
  //  0404
  findInfoForUserPage,
  //  0404
  findRelationShip,
  //  0404
  findFansList,
  //  0404
  find,
  //  0404
  login,
  //  0404
  register,
  //  0404
  isEmailExist,
};

async function findOthersInSomeBlogAndPid({
  commenter_id,
  p_id,
  blog_id,
  createdAt,
}) {
  //  [ { id, nickname, email, comments: [id, ...] }, ... ]
  let commenters = await User.readUsers(
    Opts.USER.findOthersInSomeBlogAndPid({
      commenter_id,
      p_id,
      blog_id,
      createdAt,
    })
  );
  return new SuccModel({ data: commenters });
}

const CommentController = require("./comment");
