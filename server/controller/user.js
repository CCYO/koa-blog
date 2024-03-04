/**
 * @description Controller user相關
 */
const { ErrRes, ErrModel, SuccModel, MyErr } = require("../model");
const User = require("../server/user"); //  0404
const C_Blog = require("./blog");
const C_IdolFans = require("./idolFans");
const C_ArticleReader = require("./articleReader");
const Opts = require("../utils/seq_findOpts");
const {
  ENV,
  DEFAULT: {
    CACHE: {
      TYPE: { PAGE, NEWS },
      STATUS,
    },
  },
} = require("../config");

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
async function register({ email, password }) {
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
async function login({ email, password }) {
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
async function findDataForUserPage({ cache, user_id }) {
  if (cache.exist === STATUS.NO_CACHE) {
    return await _findInfoForUserPage(user_id);
  } else {
    return new SuccModel({ data: cache.data });
  }
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
async function checkOriginPassword({ email, password }) {
  let resModel = await login({ email, password });
  if (resModel.errno) {
    throw new MyErr(ErrRes.USER.UPDATE.ORIGIN_PASSWORD_ERR);
  }
  return resModel;
}
async function modifyInfo({ _origin, ...newData }) {
  let { id: user_id } = _origin;
  //  測試舊密碼是否正確
  if (newData.hasOwnProperty("password")) {
    let { errno } = await login({
      email: _origin.email,
      password: newData.origin_password,
    });
    if (errno) {
      throw new MyErr(ErrRes.USER.UPDATE.ORIGIN_PASSWORD_ERR);
    }
    delete newData.origin_password;
    delete newData.password_again;
  }
  await User.update(Opts.USER.UPDATE.one({ user_id, newData }));
  let { data } = await find(user_id);
  let opts = { data };
  if (process.env.NODE_ENV !== "nocache") {
    //  更新數據，不是新增數據
    let cache = {
      //  個人頁 緩存肯定要刪除
      [PAGE.USER]: [user_id],
    };

    if (newData.nickname || newData.email || newData.avatar) {
      ////  處理cache
      //  偶像、粉絲 的 個人頁，刪除緩存
      let {
        data: { fansList, idolList },
      } = await _findRelationship(user_id);
      //  找出 idolFans
      let people = [...fansList, ...idolList].map(({ id }) => id);
      if (people.length) {
        cache[PAGE.USER] = cache[PAGE.USER].concat(people);
      }
      //  個人的文章緩存，刪除緩存
      let { errno, data } = await _findBlogList(user_id);
      if (!errno) {
        cache[PAGE.BLOG] = data;
      }
      //  曾留言的文章頁面，刪除緩存
      let blogs = await _findBlogListHasCommented(user_id);
      cache[PAGE.BLOG].concat(blogs);
    }
    opts.cache = cache;
  }
  return new SuccModel(opts);
}
async function find(user_id) {
  const data = await User.read(Opts.USER.FIND.one(user_id));
  if (!data) {
    return new ErrModel(ErrRes.USER.READ.NO_DATA);
  }
  return new SuccModel({ data });
}
async function confirmNews({ idol_id, idolFans_id }) {
  let idol = await User.read(
    Opts.USER.FIND.itemByIdolFans({ idol_id, idolFans_id })
  );
  if (!idol) {
    let opts = ErrRes.NEWS.READ.NOT_EXIST;
    if (!ENV.isNoCache) {
      opts.cache = { [NEWS]: [idol_id] };
    }
    return new ErrModel(opts);
  }
  let fans = idol.fansList[0];
  if (!fans.IdolFans.confirm) {
    //  更新 articleReader
    await C_IdolFans.modify(idolFans_id, { confirm: true });
  }
  let url = `/other/${fans.id}`;
  return new SuccModel({ data: { url } });
}
module.exports = {
  confirmNews,
  find,
  modifyInfo,
  checkOriginPassword,
  cancelFollow,
  follow,
  findFansList,
  findDataForUserPage,
  login,
  register,
  isEmailExist,
};

//  尋找曾留言過的文章
async function _findBlogListHasCommented(user_id) {
  let { comments } = await User.read(
    Opts.USER.FIND._blogListHasCommented(user_id)
  );
  let set_blogs = comments.reduce((acc, { article }) => {
    acc.add(article.id);
    return acc;
  }, new Set());
  return [...set_blogs];
}
async function _findInfoForUserPage(user_id) {
  let {
    data: { currentUser, fansList, idolList },
  } = await _findRelationship(user_id);
  let { data: blogs } = await C_Blog.findListForUserPage(user_id);
  let data = { currentUser, relationShip: { fansList, idolList }, blogs };
  return new SuccModel({ data });
}
//  尋找user的文章列表
async function _findBlogList(user_id) {
  let user = await User.read(Opts.USER.FIND.blogList(user_id));
  if (!user.blogs.length) {
    return new ErrModel(ErrRes.BLOG.READ.NO_LIST);
  }
  let data = user.blogs.map(({ id }) => id).filter((id) => id);
  return new SuccModel({ data });
}

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
