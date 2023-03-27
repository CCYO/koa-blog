/**
 * @description middleware of upload to GCS by Formidable
 */
const { UPDATE: { UPDATE_GCE_ERR, FORMIDABLE_ERR, NO_HASH, AVATAR_FORMAT_ERR } } = require('../model/errRes')
const { ErrModel, MyErr } = require('../model')
const formidable = require('formidable')

const { storage } = require('../db/firebase')

const { GCS_ref: { BLOG, AVATAR } } = require('../conf/constant')

/** 利用 formidable 進行 JPG圖檔上傳GCS
 * @param {object} ctx ctx
 * @param {object} bar 過渡用的，結構為{ ref: 代表GCS_file_ref, promise: 代表 formidable 作GCS上傳時，確認狀態的 promise }
 * @param {*} formidableIns formidable Ins
 * @returns {promise} 成功為null，失敗則為error
 */
async function _parse(ctx, formIns) {
    // let { ref, promise } = bar
    let gceFile = formIns._gceFile
    return new Promise((resolve, reject) => {
        formIns.parse(ctx.req, async (err, fields, files) => {
            if (err) {
                console.log('# formidable 解析發生錯誤 => \n', err)
                reject( new MyErr({ ...FORMIDABLE_ERR, err}) )
                return
            }
            if (!gceFile) {
                console.log('# 沒有圖檔上傳')
                resolve({ fields, files })
                return
            }

            try {
                await gceFile._promise
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
                await gceFile.ref.makePublic()
                
                console.log('# upload file to GCS & formidable 解析完成')
                resolve({ fields, files })
                return
            } catch (err) {
                reject( new MyErr({ ...UPDATE_GCE_ERR, err}) )
                return
            }
        })
    })
}

/** 生成 formidable Ins
 * @param {object} bar 此物件負責提供建立 formidable Ins 之 fileWriteStreamHandler 方法的 file_ref 參數，且為了能撈取 fileWriteStreamHandler 運行 GCS上傳發生的錯誤，_genFormidable 內部會在 bar 新增 promise 屬性
 * @returns {object} writeableStream 可寫流
 */
const _genFormidable = (gceFile) => {
    if (!gceFile) {
        return formidable()
    }
    let opts = {
        fileWriteStreamHandler() {   //  fileWriteStreamHandler 在調用 formidable.parse 時，才會作為 CB 調用
            let ws = gceFile.ref.createWriteStream({
                //  圖檔設定不作緩存，參考資料：https://cloud.google.com/storage/docs/metadata#caching_data
                // metadata: {
                //     contnetType: 'image/jpeg',
                //     cacheControl: 'no-cache'
                // }
            })
            //  為 bar.promise 綁定 GCS 上傳的promise，以便捕撈錯誤
            gceFile._promise = new Promise((resolve, reject) => {
                ws.on('finish', resolve)
                ws.on('error', reject)
            })
            return ws
        }
    }
    let formIns = formidable(opts)
    formIns._gceFile = gceFile
    return formIns
}


/** 上傳檔案至GCS
 * @param {object} ctx ctx.req 內含要上傳GCS的檔案
 * @returns 
 */
async function parse(ctx) {
    let { ext, hash, blog_id } = ctx.query
    let gceFile = undefined
    //  辨別這次是要處理 avatar 還是 blog內文圖片
    let prefix = !ext ? undefined : blog_id ? BLOG : AVATAR
    //  處理圖檔
    if (ext) {
        if (!hash) {
            return new ErrModel(NO_HASH)
        }
        if (ext !== 'JPG' && ext !== 'PNG') {
            return new ErrModel(AVATAR_FORMAT_ERR)
        }
        //  建立GCS ref
        gceFile = { ref: storage.bucket().file(`${prefix}/${hash}.${ext}`) }
        //  確認GCS是否有該圖檔
        let [exist] = await gceFile.ref.exists()
    }
    //  建立 promise，用來捕捉 formidable 傳送檔案給 gce 時的狀態
    // if (!exist) {
    //     gceFile._promise = undefined
    // }
    //  建立 formidable
    let formIns = _genFormidable(gceFile)
    let resModel = await _parse(ctx, formIns)
    if(resModel.errno){
        throw resModel
    }
    let { fields } = resModel
    let data = fields ? { ...fields } : {}
    if (gceFile) {
        data[prefix] = gceFile.ref.publicUrl() //+ `?hash=${hash}`
    }
    console.log('@ data => ', data)
    return data
}

module.exports = {
    parse
}