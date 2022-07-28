/**
 * @description middleware of upload to GCS by Formidable
 */

const formidable = require('formidable')

const { storage } = require('../firebase/init')

/**
 * 將jpg圖檔上傳GCS
 * @param {object} ctx 含代表「JPG圖檔hash」的 ctx.params.hash
 * @returns {string} 完成此次JPG圖檔上傳GCS後，該圖檔的公開url
 */
async function upload_jpg(ctx) {
    let { hash } = ctx.query
    //  建立GCS ref
    let file_ref = storage.bucket().file(`blog/${hash}.jpg`)
    //  確認GCS是否有該圖檔
    let [exist] = await file_ref.exists()
    //  若GCS無該JPG圖，進行GCS上傳
    if (!exist) {
        await parse(ctx, file_ref)
    }
    //  返回圖檔資訊
    let url = file_ref.publicUrl()

    return url
}

/**
 * 利用 formidable 進行 JPG圖檔上傳GCS
 * @param {object} ctx ctx
 * @param {object} bar 過渡用的，結構為{ ref: 代表GCS_file_ref, promise: 代表 formidable 作GCS上傳時，確認狀態的 promise }
 * @param {*} formidableIns formidable Ins
 * @returns {promise} 成功為null，失敗則為error
 */
async function _parse(ctx, bar, formidableIns) {
    let { ref, promise } = bar
    return new Promise((resolve, reject) => {
        formidableIns.parse(ctx.req, async (err, fields, files) => {
            if (err) {
                console.log('formidable 解析發生錯誤')
                reject(err)
                return
            }
            if (!promise){
                console.log('@fields =====> ', fields)
                resolve({ fields })
                return
            }

            try {
                await promise
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
                await ref.makePublic()
                console.log('upload file to GCS & formidable 解析完成')
                // resolve({ fields, files })
                resolve({ fields })
                return
            } catch (e) {
                console.log('upload file to GCS 發生錯誤')
                reject(e)
                return
            }
        })
    })
}

/**
 * 生成 formidable Ins
 * @param {object} bar 此物件負責提供建立 formidable Ins 之 fileWriteStreamHandler 方法的 file_ref 參數，且為了能撈取 fileWriteStreamHandler 運行 GCS上傳發生的錯誤，_gen_formidable 內部會在 bar 新增 promise 屬性
 * @returns {object} writeableStream 可寫流
 */
const _gen_formidable = (bar) => {
    let file = bar.ref
    let Ops = {}

    if (file) {
        /** fileWriteStream 第一個參數的組成
         * VolatileFile {
         *    _events: [Object: null prototype] { error: [Function (anonymous)] },
         *    _eventsCount: 1,
         *    _maxListeners: undefined,
         *    lastModifiedDate: null,
         *    filepath: '/tmp/9cd4640d94ec41a4e3a352400',
         *    newFilename: '9cd4640d94ec41a4e3a352400',
         *    originalFilename: '6097898.jpg',
         *    mimetype: 'image/jpeg',
         *    hashAlgorithm: false,
         *    createFileWriteStream: [Function: fileWriteStreamHandler],
         *    size: 0,
         *    _writeStream: null,
         *    hash: null,
         *    [Symbol(kCapture)]: false
         * }
         */
        Ops.fileWriteStreamHandler = function() {
            let ws = file.createWriteStream({
                //  圖檔設定不作緩存，參考資料：https://cloud.google.com/storage/docs/metadata#caching_data
                metadata: {
                    contnetType: 'image/jpeg',
                    cacheControl: 'no-store'
                }
            })
            //  為 bar.promise 綁定 GCS 上傳的promise，以便捕撈錯誤
            bar.promise = new Promise((resolve, reject) => {
                ws
                    .on('finish', resolve)
                    .on('error', reject)
            })
            return ws
        }
    }
    return formidable(Ops)
}

/**
 * 上傳檔案至GCS
 * @param {object} ctx ctx.req 內含要上傳GCS的檔案
 * @param {string} ref GCS_file_ref
 * @returns 
 */
async function parse(ctx, ref) {
    let bar = { ref, promise: undefined }
    form = _gen_formidable(bar)
    return await _parse(ctx, bar, form)
}

module.exports = {
    parse,
    upload_jpg
}