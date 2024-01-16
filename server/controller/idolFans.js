const { SuccModel, ErrRes, MyErr } = require("../model"); //  0406
const {
  ENV,
  DEFAULT: {
    CACHE: {
      TYPE: { PAGE, NEWS },
    },
  },
} = require("../config"); //  0406
const C_ArticleReader = require("./articleReader"); //  0406
const IdolFans = require("../server/idolFans"); //  0406
const C_User = require("./user"); //  0406
const S_User = require("../server/user");
const Opts = require("../utils/seq_findOpts"); //  0406
//  ------------------------------------------------
const S_ArticalReader = require("../server/articleReader");
//  0423
async function confirmList(datas) {
  let updatedAt = new Date();
  let newDatas = datas.map((data) => ({ ...data, updatedAt, confirm: true }));
  let list = await IdolFans.updateList(newDatas);
  if (list.length !== newDatas.length) {
    throw new MyErr(ErrRes.IDOL_FANS.UPDATE.CONFIRM);
  }
  return new SuccModel({ data: list });
}

//  0426
async function addList(datas) {
  let updateOnDuplicate = [
    "id",
    "idol_id",
    "fans_id",
    "confirm",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ];
  let list = await IdolFans.updateList(datas, updateOnDuplicate);
  if (list.length !== datas.length) {
    throw new MyErr(ErrRes.IDOL_FANS.CREATE.ROW);
  }
  return new SuccModel({ data: list });
}

//  --------------------------------------------------------------------------------------
//  0406
/** 取消追蹤
 * @param {number} fans_id
 * @param {number} idol_id
 * @returns {object} SuccessModel | ErrorModel
 */
async function cancelFollow({ fans_id, idol_id }) {
  //  尋找 IdolFans + ArticleReader 關係
  let {
    data: { idolFans, articleReaders },
  } = await C_User.findInfoForCancelFollow({
    fans_id,
    idol_id,
  });
  await _removeList([idolFans]);
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
//  0406
async function _removeList(id_list) {
  let row = await IdolFans.deleteList(Opts.FOLLOW.REMOVE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ErrRes.IDOL_FANS.DELETE.ROW_ERR);
  }
  return new SuccModel();
}
/** 追蹤
 * @param {number} fans_id
 * @param {number} idol_id
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function follow({ fans_id, idol_id }) {
  //  若此次 add 不是第一次，代表可能會有軟刪除的 ArticleReader 關係
  //  尋找軟刪除的 IdolFans + ArticleReader 關係
  let { errno, data } = await C_User.findInfoForFollowIdol({
    fans_id,
    idol_id,
  });
  //  恢復軟刪除
  if (errno) {
    ////  非初次follow
    let { idolFans, articleReaders } = data;
    //  恢復 idolFans 軟刪除狀態
    await IdolFans.restoring(idolFans);
    //  恢復 articleReader 軟刪除狀態
    await Promise.all(
      articleReaders.map((id) => S_ArticalReader.restoring(id))
    );
  } else {
    ////  初次追蹤
    await S_User.createIdol({ fans_id, idol_id });
  }
  let cache = { [NEWS]: [idol_id] };
  if (!ENV.isNoCache) {
    cache[PAGE.USER] = [fans_id, idol_id];
  }
  return new SuccModel({ cache });
}
module.exports = {
  //  0423
  confirmList,
  //  ---------------------------------------------------------------------------
  cancelFollow,
  follow,
};
