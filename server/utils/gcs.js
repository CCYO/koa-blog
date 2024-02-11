/**
 * @description middleware of upload to GCS by Formidable
 */
//  0516
const formidable = require("formidable");
//  0516
const { storage } = require("../db/firebase");
//  0516
const { ErrRes, MyErr } = require("../model");
//  0516
const {
  DEFAULT: {
    GCS_ref: { BLOG, AVATAR },
  },
} = require("../config");
//  處理 blog 內文圖片
async function blogImg(ctx) {
  //  上傳 blog 內文圖片時，會附上圖片相關資料
  let { ext, hash } = ctx.query;
  if (ext) {
    ext = ext.toUpperCase();
    if (ext !== "JPG" && ext !== "PNG") {
      throw new MyErr(ErrRes.UPDATE.AVATAR_FORMAT_ERR);
    }
  } else {
    throw new MyErr(ErrRes.UPDATE.NO_EXT);
  }
  if (!hash) {
    throw new MyErr(ErrRes.UPDATE.NO_HASH);
  }
  let res = { [BLOG]: undefined };
  //  即將存入遠端庫的圖片路徑
  let ref = storage.bucket().file(`${BLOG}/${hash}.${ext}`);
  let [exist] = await ref.exists();
  if (exist) {
    res[BLOG] = ref.publicUrl();
  } else {
    ctx._my = { gceFile: { ref } };
    //  建立 formidable Ins
    await _parse(ctx);
    res[BLOG] = ref.publicUrl();
    delete ctx._my;
  }
  return res;
}
//  處理 user avatar
async function user(ctx) {
  let { avatar_ext, avatar_hash } = ctx.request.query;
  if (avatar_ext && !avatar_hash) {
    throw new MyErr(ErrRes.USER.UPDATE.AVATAR_NO_ARGS_HASH);
  } else if (avatar_hash && !avatar_ext) {
    throw new MyErr(ErrRes.USER.UPDATE.AVATAR_NO_ARGS_EXT);
  } else if (avatar_hash === ctx.session.user.avatar_hash) {
    throw new MyErr(ErrRes.USER.UPDATE.SAME_AVATAR_HASH);
  }
  let res;
  let ref;
  if (avatar_ext && avatar_hash) {
    avatar_ext = avatar_ext.toUpperCase();
    if (avatar_ext !== "JPG" && avatar_ext !== "PNG") {
      throw new MyErr(ErrRes.USER.UPDATE.AVATAR_FORMAT_ERR);
    }
    //  即將存入遠端庫的圖片路徑
    ref = storage.bucket().file(`${AVATAR}/${avatar_hash}.${avatar_ext}`);
    let [exist] = await ref.exists();
    if (!exist) {
      ctx._my = { gceFile: { ref } };
    }
  }
  let { fields } = await _parse(ctx);
  if (!ref && !Object.getOwnPropertyNames(fields).length) {
    throw new MyErr(ErrRes.USER.UPDATE.NO_DATA);
  }
  res = { ...fields };
  if (ref) {
    delete ctx._my;
    //  解析
    res[AVATAR] = ref.publicUrl();
  }
  return res;
}

module.exports = {
  user,
  blogImg,
};

/** 生成 formidable Ins
 * @param {object} bar 此物件負責提供建立 formidable Ins 之 fileWriteStreamHandler 方法的 file_ref 參數，且為了能撈取 fileWriteStreamHandler 運行 GCS上傳發生的錯誤，_genFormidable 內部會在 bar 新增 promise 屬性
 * @returns {object} writeableStream 可寫流
 */
const _parse = (ctx) => {
  let gceFile = ctx._my?.gceFile;
  //  取自定義、用來生成 formidable Ins 的參數
  let formidableIns;
  //  創建 formidable Ins
  if (!gceFile) {
    //  若未定義，表示這次parse沒有File類型的數據
    formidableIns = formidable();
  } else {
    //  這次parse有File類型的數據，則對 formidable 進行配置，讓 File 可以直接上傳 GFB
    let opts = {
      fileWriteStreamHandler() {
        //  formidable Ins 調用 parse 時，fileWriteStreamHandler 作為 CB 調用
        let ws = gceFile.ref.createWriteStream(/* wsOpts */);
        //  創建寫入流
        //  wsOpts 可作緩存設定（參考資料：https://cloud.google.com/storage/docs/metadata#caching_data）
        //  以「不緩存」為例↓
        // wsOpts.metadata: { contnetType: 'image/jpeg', cacheControl: 'no-cache' }
        gceFile.promise = new Promise((resolve, reject) => {
          //  為 bar.promise 綁定 GCS 上傳的promise，以便捕撈錯誤
          ws.on("finish", resolve);
          ws.on("error", reject);
        });
        return ws;
      },
    };
    formidableIns = formidable(opts);
  }
  //  執行 formidableIns.parse
  return new Promise((resolve, reject) => {
    formidableIns.parse(ctx.req, async (error, fields, files) => {
      if (error) {
        throw new MyErr({ ...ErrRes.USER.UPDATE.FORMIDABLE_ERR, error });
        //  拋出 formidable 解析錯誤
      }
      if (!gceFile) {
        if (!Object.getOwnPropertyNames(fields).length) {
          throw new MyErr(ErrRes.USER.UPDATE.NO_ARGS_DATA);
        }
        //  請求內沒有夾帶 files，返回 fields
        return resolve({ fields });
      }
      try {
        //  判斷圖檔上傳GFB的狀況
        await gceFile.promise;
        //  等待處理完畢
        await gceFile.ref.makePublic();
        //  將圖檔在GFB的遠端路徑設為公開
        return resolve({ fields, files });
      } catch (error) {
        throw new MyErr({ ...ErrRes.USER.UPDATE.GCE_ERR, error });
        //  拋出圖檔上傳GFB發生的錯誤
      }
    });
  });
};
