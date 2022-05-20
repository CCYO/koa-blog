/**
 * @description middleware of upload to GCS by Formidable
 */

const formidable = require('formidable')

const storage = require('../firebase/init')

const upload_jpg = async (ctx) => {
    let { img_hash: hash } = ctx.params
    let file_ref = storage.bucket().file(`blog/${hash}.jpg`)
    let [exist] = await file_ref.exists()
    console.log('@exist => ', exist)
    //  正常修改
    ctx._my = (!exist) ? { file: file_ref } : null
    ctx._my && await parse(ctx)

    delete ctx._my
    console.log('@完成上傳 => ', file_ref.publicUrl(), hash)
    return { url: file_ref.publicUrl(), hash }
}

async function _parse(ctx, formidableIns) {
    return new Promise((resolve, reject) => {
        formidableIns.parse(ctx.req, async (err, fields, files) => {
            if (err) {
                console.log('formidable 解析發生錯誤')
                reject(err)
                return
            }
            if (!ctx._my.file) {
                console.log('沒有進行upload GCS')
                resolve({ fields, files })
                return
            }
            try {
                await ctx._my.promise
                //#region makePublic RV
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
                await ctx._my.file.makePublic()
                console.log('upload file to GCS & formidable 解析完成')
                resolve({ fields, files })
                return
            } catch (e) {
                console.log('upload file to GCS 發生錯誤')
                reject(e)
                return
            }
        })
    })
}

const _gen_formidable = (ctx) => {
    //  若沒有新圖
    if (!ctx._my.file) {
        return formidable()
    }

    return formidable({
        /**
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
        fileWriteStreamHandler() {
            let file = ctx._my.file
            let ws = file.createWriteStream({
                //  https://cloud.google.com/storage/docs/metadata#caching_data
                metadata: {
                    contnetType: 'image/jpeg',
                    cacheControl: 'no-store'
                }
            })
            //  在 ctx._my.promise 建構一個 promise，
            //  已便捕獲上傳GCS時的錯誤
            ctx._my.promise = new Promise((resolve, reject) => {
                ws
                    .on('finish', resolve)
                    .on('error', reject)
            })
            return ws
        }
    })
}

async function parse(ctx) {
    form = _gen_formidable(ctx)
    return await _parse(ctx, form)
}

module.exports = {
    parse,
    upload_jpg
}