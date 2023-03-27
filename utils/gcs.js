/**
 * @description middleware of upload to GCS by Formidable
 */
const { UPDATE: { AVATAR_FORMAT_ERR } } = require('../model/errRes')
const { ErrModel } = require('../model')
const formidable = require('formidable')

const { storage } = require('../db/firebase')

const { GCS_ref: { BLOG, AVATAR } } = require('../conf/constant')

/** 利用 formidable 進行 JPG圖檔上傳GCS
 * @param {object} ctx ctx
 * @param {object} bar 過渡用的，結構為{ ref: 代表GCS_file_ref, promise: 代表 formidable 作GCS上傳時，確認狀態的 promise }
 * @param {*} formidableIns formidable Ins
 * @returns {promise} 成功為null，失敗則為error
 */
async function _parse(ctx, bar, formidableIns) {
    // let { ref, promise } = bar

    return new Promise((resolve, reject) => {
        formidableIns.parse(ctx.req, async (err, fields, files) => {
            if (err) {
                console.log('# formidable 解析發生錯誤 => \n', err)
                reject(err)
                return
            }
            if (!bar.ref) {
                console.log('# 沒有avatar上傳')
                resolve({ fields, files })
                return
            }

            try {
                await bar._promise
                //#region makePublic RV的組成
                /**
                 * [
                 *   {
                 *     kind: 'storage#objectAccessControl',
                 *     object: '2/avatar.jpg',
                 *     generation: '1650967655043642',
                 *     id: 'gfb20220419.appspot.com/2/avatar.jpg/1650967655043642/allUsers',
                 *     selfLink: 'https://www.googleapis.com/storage/v1/b/gfb20220419.appspot.com/o/2%2Favatar.jpg/acl/allUsers',
                 *     bucket: 'gfb20220419.appspot.com',
                 *     entity: 'allUsers',
                 *     role: 'READER',
                 *     etag: 'CLqk9eS9sfcCEAM='
                 *   }
                 * ]
                 */
                //#endregion
                await bar.ref.makePublic()
                console.log('# upload file to GCS & formidable 解析完成')
                resolve({ fields, files })
                return
            } catch (e) {
                console.log('# upload file to GCS 發生錯誤 => \n', e)
                reject(e)
                return
            }
        })
    })
}

/** 生成 formidable Ins
 * @param {object} bar 此物件負責提供建立 formidable Ins 之 fileWriteStreamHandler 方法的 file_ref 參數，且為了能撈取 fileWriteStreamHandler 運行 GCS上傳發生的錯誤，_gen_formidable 內部會在 bar 新增 promise 屬性
 * @returns {object} writeableStream 可寫流
 */
const _gen_formidable = (bar) => {
    let Ops = {}

    if (bar.ref) {
        Ops.fileWriteStreamHandler = function () {   //  fileWriteStreamHandler 在調用 formidable.parse 時，才會作為 CB 調用
            let ws = bar.ref.createWriteStream({
                //  圖檔設定不作緩存，參考資料：https://cloud.google.com/storage/docs/metadata#caching_data
                // metadata: {
                //     contnetType: 'image/jpeg',
                //     cacheControl: 'no-cache'
                // }
            })
            //  為 bar.promise 綁定 GCS 上傳的promise，以便捕撈錯誤
            bar._promise = new Promise((resolve, reject) => {
                ws
                    .on('finish', resolve)
                    .on('error', reject)
            })
            return ws
        }
    }
    return formidable(Ops)
}

/** 上傳檔案至GCS
 * @param {object} ctx ctx.req 內含要上傳GCS的檔案
 * @returns 
 */
async function parse(ctx) {
    let { ext, hash, blog_id } = ctx.query
    if (hash && ext !== 'JPG' && ext !== 'PNG') {
        throw new ErrModel(AVATAR_FORMAT_ERR)
    }

    let prefix = blog_id ? BLOG : AVATAR
    let res = {}
    let bar = { ref: undefined }

    if (hash) {
        //  建立GCS ref
        bar.ref = storage.bucket().file(`${prefix}/${hash}.${ext}`)
        //  確認GCS是否有該圖檔
        let [exist] = await bar.ref.exists()
        if (!exist) {
            bar._promise = undefined
        }
    }
    let form = _gen_formidable(bar)
    let { fields } = await _parse(ctx, bar, form)
    res = fields ? { ...fields } : {}
    if (bar.ref) {
        res[prefix] = bar.ref.publicUrl() //+ `?hash=${hash}`
    }
    return res
}

module.exports = {
    parse
}