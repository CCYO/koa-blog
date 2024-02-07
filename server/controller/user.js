/**
 * @description Controller user相關
 */
const SEQ_OPTIONS = require("../utils/seq_options");

const {
  DEFAULT: {
    CACHE: {
      TYPE: {
        API,
        PAGE, //  0228
        NEWS, //  0228
      },
    },
  },
} = require("../config");
const C_MsgReceiver = require("./msgReceiver");
const C_Comment = require("./comment");
const C_ArticlReader = require("./articleReader");
const Init = require("../utils/init"); //  0421
const C_Blog = require("./blog"); //  0309
const { ErrRes, ErrModel, SuccModel, MyErr } = require("../model"); //  0404
const Opts = require("../utils/seq_findOpts"); //  0404
const User = require("../server/user"); //  0404

//  --------------------------------------------
const C_IdolFans = require("./idolFans");
const C_ArticleReader = require("./articleReader");
const { ENV } = require("../config");

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
      } = await _findRelationship(user_id);

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

// ----------------------------------------------------------------------------------------------

/** 確認信箱是否已被註冊
 * @param {string} email 信箱
 * @returns {object} resModel
 */
async function isEmailExist(email) {
  const exist = await User.read(Opts.USER.FIND.email(email));
  if (exist) {
    return new ErrModel(ErrRes.USER.READ.EMAIL_EXIST);
  }
  return new SuccModel();
}
/** 註冊
 * @param {string} email - user 的信箱
 * @param {string} password - user 未加密的密碼
 * @returns {object} SuccessMode || ErrModel Instance
 */
async function register(email, password) {
  if (!password) {
    return new ErrModel(ErrRes.USER.READNO_PASSWORD);
  } else if (!email) {
    return new ErrModel(ErrRes.USER.READ.NO_EMAIL);
  }
  const resModel = await isEmailExist(email);
  if (resModel.errno) {
    return resModel;
  }
  const data = await User.create(Opts.USER.CREATE.one({ email, password }));
  return new SuccModel({ data });
}
/** 登入 user
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns resModel
 */
async function login(email, password) {
  if (!email) {
    return new ErrModel(ErrRes.USER.READ.NO_EMAIL);
  } else if (!password) {
    return new ErrModel(ErrRes.USER.READ.NO_PASSWORD);
  }
  const data = await User.read(Opts.USER.FIND.login({ email, password }));
  if (!data) {
    return new ErrModel(ErrRes.USER.READ.LOGIN_FAIL);
  }
  return new SuccModel({ data });
}
async function findInfoForUserPage(userId) {
  let resModel = await _findRelationship(userId);
  let { currentUser, fansList, idolList } = resModel.data;
  let { data: blogs } = await C_Blog.findListForUserPage(userId);
  let data = { currentUser, relationShip: { fansList, idolList }, blogs };
  return new SuccModel({ data });
}
async function find(user_id) {
  const data = await User.read(Opts.USER.FIND.one(user_id));
  if (!data) {
    return new ErrModel(ErrRes.USER.READ.NO_DATA);
  }
  return new SuccModel({ data });
}
async function findFansList(idol_id) {
  let data = await User.readList(Opts.USER.FIND.fansList(idol_id));
  return new SuccModel({ data });
}
/** 追蹤
 * @param {number} fans_id
 * @param {number} idol_id
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function follow({ fans_id, idol_id }) {
  //  若此次 add 不是第一次，代表可能會有軟刪除的 ArticleReader 關係
  //  尋找軟刪除的 IdolFans + ArticleReader 關係
  let { errno, data } = await _findInfoForFollowIdol({
    fans_id,
    idol_id,
  });
  //  恢復軟刪除
  if (errno) {
    ////  非初次follow
    let { idolFans, articleReaders } = data;
    //  恢復 idolFans 軟刪除狀態
    await C_IdolFans.restoringList([idolFans]);
    //  恢復 articleReader 軟刪除狀態
    await C_ArticleReader.restoringList(articleReaders);
  } else {
    ////  初次追蹤
    await User.createIdol({ fans_id, idol_id });
  }
  let cache = { [NEWS]: [idol_id] };
  if (!ENV.isNoCache) {
    cache[PAGE.USER] = [fans_id, idol_id];
  }
  return new SuccModel({ cache });
}
/** 取消追蹤
 * @param {number} fans_id
 * @param {number} idol_id
 * @returns {object} SuccessModel | ErrorModel
 */
async function cancelFollow({ fans_id, idol_id }) {
  //  尋找 IdolFans + ArticleReader 關係
  let {
    data: { idolFans, articleReaders },
  } = await _findInfoForCancelFollow({
    fans_id,
    idol_id,
  });
  await C_IdolFans.removeList([idolFans]);
  if (articleReaders.length) {
    await C_ArticleReader.removeList(articleReaders);
  }
  let options = undefined;
  if (!ENV.isNoCache) {
    cache = { [PAGE.USER]: [fans_id, idol_id] };
    options = { cache };
  }
  return new SuccModel(options);
}
module.exports = {
  //  0514
  modify,
  //  0406

  //  0404
  findOthersInSomeBlogAndPid,
  //  ------------------------------
  cancelFollow,
  follow,
  findFansList,
  find,
  findInfoForUserPage,
  login,
  register,
  isEmailExist,
};
async function _findInfoForCancelFollow({ fans_id, idol_id }) {
  let { errno } = await find(idol_id);
  if (errno) {
    throw new MyErr({
      ...ErrRes.USER.READ.NO_IDOL,
      error: `idol_id: ${idol_id} 不存在`,
    });
  }
  let { idols, articles } = await User.read(
    Opts.USER.FIND.infoForCancelFollow({ fans_id, idol_id })
  );
  let idolFans = idols[0].IdolFans.id;
  let articleReaders = articles.map(({ ArticleReader }) => ArticleReader.id);
  let data = { idolFans, articleReaders };
  return new SuccModel({ data });
}
async function _findInfoForFollowIdol({ fans_id, idol_id }) {
  let { errno } = await find(idol_id);
  if (errno) {
    throw new MyErr({
      ...ErrRes.USER.READ.NO_IDOL,
      error: new Error(`idol_id: ${idol_id} 不存在`),
    });
  }
  let { idols, articles } = await User.read(
    Opts.USER.FIND.infoForFollowIdol({ fans_id, idol_id })
  );
  if (!idols.length) {
    return new SuccModel();
  }
  let idolFans = idols[0].IdolFans.id;
  let articleReaders = articles.map(({ ArticleReader }) => ArticleReader.id);
  let data = { idolFans, articleReaders };
  return new ErrModel({ ...ErrRes.USER.READ.NOT_FIRST_FOLLOW, data });
}
async function _findIdolList(fans_id) {
  let data = await User.readList(Opts.USER.FIND.idolList(fans_id));
  return new SuccModel({ data });
}
async function _findRelationship(userId) {
  let resModel = await find(userId);
  if (resModel.errno) {
    throw new MyErr(resModel);
  }
  let { data: currentUser } = resModel;
  let { data: idolList } = await _findIdolList(userId);
  let { data: fansList } = await findFansList(userId);
  let data = { currentUser, idolList, fansList };
  return new SuccModel({ data });
}
