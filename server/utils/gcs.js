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

/** 自行封裝 formidable parse，內部包含「圖檔上傳FireBase」的判斷
 * @param {object} ctx ctx
 * @param {object} bar 過渡用的，結構為{ ref: 代表GCS_file_ref, promise: 代表 formidable 作GCS上傳時，確認狀態的 promise }
 * @param {*} formidableIns formidable Ins
 * @returns {promise} 成功為null，失敗則為error
 */
// async function _parse(ctx, formIns) {
//     // let { ref, promise } = bar
//     let gceFile = formIns._gceFile
//     return new Promise((resolve, reject) => {
//         formIns.parse(ctx.req, async (err, fields, files) => {
//             if (err) {
//                 throw new MyErr({ ...ErrRes.UPDATE.FORMIDABLE_ERR, err })
//                 //  拋出 formidable 解析錯誤
//             }
//             try {
//                 //  判斷圖檔上傳GFB的狀況
//                 await gceFile._promise
//                 //  等待處理完畢
//                 await gceFile.ref.makePublic()
//                 //  將圖檔在GFB的遠端路徑設為公開
//                 resolve({ fields, files })
//             } catch (err) {
//                 reject(new MyErr({ ...ErrRes.UPDATE.UPDATE_GCE_ERR, err }))
//                 //  拋出圖檔上傳GFB發生的錯誤
//             }
//             return
//         })
//     })
// }
/** 生成 formidable Ins
 * @param {object} bar 此物件負責提供建立 formidable Ins 之 fileWriteStreamHandler 方法的 file_ref 參數，且為了能撈取 fileWriteStreamHandler 運行 GCS上傳發生的錯誤，_genFormidable 內部會在 bar 新增 promise 屬性
 * @returns {object} writeableStream 可寫流
 */
const _parse = (ctx) => {
  let gceFile = ctx._my.gceFile;
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
    formidableIns.parse(ctx.req, async (err, fields, files) => {
      if (err) {
        throw new MyErr({ ...ErrRes.UPDATE.FORMIDABLE_ERR, err });
        //  拋出 formidable 解析錯誤
      }
      if (!gceFile) {
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
      } catch (err) {
        throw new MyErr({ ...ErrRes.UPDATE.UPDATE_GCE_ERR, err });
        //  拋出圖檔上傳GFB發生的錯誤
      }
    });
  });
};
// /** 處理 FORM 類型的請求數據
//  * @param {object} ctx ctx.req 內含要上傳GCS的檔案
//  * @returns
//  */
// async function parse(ctx) {
//     //  上傳 blog 內文圖片時，會附上圖片相關資料
//     let { ext, hash, blog_id } = ctx.query
//     //  即將存入遠端庫的圖片路徑
//     let gceFile = undefined
//     //  辨別這次是要處理 avatar 還是 blog內文圖片
//     let prefix = !ext ? undefined : blog_id ? BLOG : AVATAR
//     //  處理圖檔
//     if (ext) {
//         if (!hash) {
//             throw new MyErr(ErrRes.UPDATE.NO_HASH)
//         }
//         if (ext !== 'JPG' && ext !== 'PNG') {
//             throw new MyErr(ErrRes.UPDATE.AVATAR_FORMAT_ERR)
//         }
//         //  建立GCS ref
//         gceFile = { ref: storage.bucket().file(`${prefix}/${hash}.${ext}`) }
//         //  確認GCS是否有該圖檔
//         // let [exist] = await gceFile.ref.exists()
//     }
//     //  建立 promise，用來捕捉 formidable 傳送檔案給 gce 時的狀態
//     // if (!exist) {
//     //     gceFile._promise = undefined
//     // }
//     //  建立 formidable
//     let formIns = _genFormidable(gceFile)
//     let resModel = await _parse(ctx, formIns)
//     if (resModel.errno) {
//         throw resModel
//     }
//     let { fields } = resModel
//     let data = fields ? { ...fields } : {}
//     if (gceFile) {
//         data[prefix] = gceFile.ref.publicUrl() //+ `?hash=${hash}`
//     }
//     console.log('@ data => ', data)
//     return data
// }
const parse = {
  async user(ctx) {
    ctx._my = {
      gceFile: undefined,
    };
    let ref = undefined;
    let { avatar_ext, avatar_hash } = ctx.request.query;
    //  avatar 的 hash 與 ext
    if (avatar_ext && avatar_hash) {
      if (avatar_hash === ctx.session.user.avatar_hash) {
        throw new MyErr(ErrRes.UPDATE.AVATAR_HASH_ERR);
      }
      avatar_ext = avatar_ext.toUpperCase();
      if (avatar_ext !== "JPG" && avatar_ext !== "PNG") {
        throw new MyErr(ErrRes.UPDATE.AVATAR_FORMAT_ERR);
      }
      //  即將存入遠端庫的圖片路徑
      ref = storage.bucket().file(`${AVATAR}/${avatar_hash}.${avatar_ext}`);
      let [exist] = await ref.exists();
      if (!exist) {
        ctx._my.gceFile = { ref };
      }
    } else if (avatar_ext && !avatar_hash) {
      throw new MyErr(ErrRes.UPDATE.NO_HASH);
    } else if (!avatar_ext && avatar_hash) {
      throw new MyErr(ErrRes.UPDATE.NO_EXT);
    }
    let { fields } = await _parse(ctx);
    if (!ref && !Object.getOwnPropertyNames(fields).length) {
      throw new MyErr(ErrRes.UPDATE.NO_DATA);
    }
    let res = { ...fields };
    //  解析
    if (ref) {
      res[AVATAR] = ref.publicUrl();
    }
    delete ctx._my;
    return res;
  },
  async blogImg(ctx) {
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
  },
};

module.exports = {
  parse,
};
