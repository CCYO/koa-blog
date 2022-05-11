/**
 * @description middleware of upload to GCS by Formidable
 */

const formidable = require('formidable')

const storage = require('../firebase/init')

const upload_blogImg_to_GCS = async (ctx) => {
    const { hash } = ctx.params
    let filename = `blog/${hash}.jpg`
    let file = storage.bucket().file(filename)
    //  確認檔案是否已存在
    let [ exist ] = await file.exists()
    //  若不存在，執行 upload
    if(!exist){
        await upload_jpg_to_GCS(file, ctx)
        let makePublic = await file.makePublic()
        console.log('@makePublic => ', makePublic)
    }
    //  若存在，直接返回 PublicUrl.
    return file.publicUrl()
}

const upload_avatar_to_GCS = async (ctx) => {
    const hash = ctx.params.hash
    let filename_gcs = `blog/${hash}.jpg`
    let file_gcs = storage.bucket().file(filename_gcs)
    let [file_is_exist] = await file_gcs.exists()
    
    //  不存在，upload to GCS
    if (!file_is_exist) {
        let promise_4_upload_from_formidable_2_GCS
        let formidableIns = _gen_formidable(file_gcs, promise_4_upload_from_formidable_2_GCS)
        var { fields, files } = await _parse(formidableIns, ctx, promise_4_upload_from_formidable_2_GCS)
        await file_gcs.makePublic()
    }
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
        let url = file_gcs.publicUrl()
        /**
         * [ 
         *   {
         *     kind: 'storage#object',
         *     id: 'gfb20220419.appspot.com/2/avatar.jpg/1650967655043642',
         *     selfLink: 'https://www.googleapis.com/storage/v1/b/gfb20220419.appspot.com/o/2%2Favatar.jpg',
         *     mediaLink: 'https://storage.googleapis.com/download/storage/v1/b/gfb20220419.appspot.com/o/2%2Favatar.jpg?generation=1650967655043642&alt=media',
         *     name: '2/avatar.jpg',
         *     bucket: 'gfb20220419.appspot.com',
         *     generation: '1650967655043642',
         *     metageneration: '2',
         *     contentType: 'image/jpeg',
         *     storageClass: 'STANDARD',
         *     size: '9861',
         *     md5Hash: 'OjojAbdEsRJSsCrX7/6MCA==',
         *     crc32c: '82ub8w==',
         *     etag: 'CLqk9eS9sfcCEAI=',
         *     timeCreated: '2022-04-26T10:07:35.050Z',
         *     updated: '2022-04-26T10:07:35.151Z',
         *     timeStorageClassUpdated: '2022-04-26T10:07:35.050Z'
         *   },
         *   PassThrough { xxx }
         * ]
         */
        // const metadata = await file.getMetadata()
        console.log('@fields => ', fields)
    return { url }
}

async function _parse(formidableIns, ctx, promise) {
    return new Promise((resolve, reject) => {
        formidableIns.parse(ctx.req, async (err, fields, files) => {
            try {
                console.log('@OK')
                await promise
            } catch (e) {
                console.log('@X')
                reject(e)
                return
            }
            if (err) {
                console.log('@XX')
                reject(err)
            } else {
                console.log('@OKOK')
                /**
                 * files, fields 是 KV-pairs 類型，
                 * key 由前端 formData(key, file) 的 key 決定
                 * val 是 obj 類型
                 */
                resolve({ fields, files })
            }
            return
        })
    })
}

const _gen_formidable = (file_gcs, promise) => {
    return formidable({
        fileWriteStreamHandler(file) {
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
            
            
            let ws = file_gcs.createWriteStream({
                //  https://cloud.google.com/storage/docs/metadata#caching_data
                metadata: {
                    contnetType: 'image/jpeg',
                    cacheControl: 'no-store'
                }
            })
            promise = new Promise((resolve, reject) => {
                ws
                    .on('finish', resolve)
                    .on('error', reject)
            })
            return ws
        }
    })
}

async function upload_jpg_to_GCS(file_gcs, ctx){
    let promise
    let form = _gen_formidable(file_gcs, promise)
    await _parse(form, ctx, promise)
    return file
} 

module.exports = {
    upload_avatar_to_GCS,
    upload_blogImg_to_GCS
}