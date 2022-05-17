/**
 * @description middleware of upload to GCS by Formidable
 */

const formidable = require('formidable')

const storage = require('../firebase/init')

const { readImg, findImg_And_associate_blog } = require('../server/editor')
const { read: readUser } = require('../server/user')

const {
    createBlog, updateBlog: updateBlog_S,
    readImg,
    createImg,
    img_associate_blog,
    deleteBlogImg
} = require('../server/editor')

async function upload_Img_to_GCS(ctx, next) {
    let file, img

    //  判斷要處理的圖片是 blog img 還是 avatar
    let { blog_id } = ctx.params
    let fn = ( !blog_id ) ? upload_avatar_to_GCS : upload_blogImg_to_GCS

    await fn(ctx)

    let filename = ''

    //  blogImg 一定有 hash，

    //  avatar 要判斷有沒有 hash


    


    if (img_hash) {
        let img_data = { hash: img_hash }

        //  若 SQL 有資料
        if (res) {
            ctx.fields = res
        } else {
            file = storage.bucket.file(`blog/${img_hash}.jpg`)
        }
        fn_go = upload_blogImg_to_GCS
    } else if (avatar_hash > 0) {
        file = storage.bucket.file(`avatar/${id}.jpg`)
        fn_go = upload_avatar_to_GCS
    } else {
        fn_go = upload_avatar_to_GCS
    }

    await fn_go(ctx, file)
}

const upload_blogImg_to_GCS = async (ctx) => {
    let file
    let exist = false

    const { img_hash: hash , blog_id } = ctx.params
    const { id } = ctx.user

    // 判斷SQL有沒有同圖的紀錄
    let res = await findImg_And_associate_blog({ hash }, blog_id)

    //  有，SQL OK，GCS OK
    ctx.field = {...res}
    

    //  無，判斷 GCS 有沒有同圖圖檔
    let filename = `/blog/${hash}.jpg`
    let file = storage.bucket.file(filename)
    let [exist] = await file.exist()

    //  有，GCS OK，SQL待處理
    let url = file.publicUrl()

    //  無，GCS、SQL 待處理
    //  處理GCS
    let fields = await parse(ctx, file)
    await file.makePublic()
    let url = file.publicUrl()

    //  處理SQL
    


    ctx.fields = { ...fields, url }




    //  SQL 若有同圖，直接與 blog 作關聯
    
    //  SQL 若無同圖，upload to GCS
    if (!res) {
        //  確認 gcs 內有無同圖
        let filename = `/blog/${img_hash}.jpg`
        file = storage.bucket.file(filename)
        res = await file.exist()
        exist = res.exist
    }
    let { fields } = await upload_file_to_GCS(ctx, file)
    !exist && await file.makePublic()
    if (res.id) {
        ctx.fields = { ...res, ...fields }
    } else {
        ctx.fields = { ...fields, url: file.publicUrl() }
    }
    return
}

const upload_avatar_to_GCS = async (ctx, file) => {
    let { id } = ctx.session.user
    let { avatar_hash } = ctx.params
    let { fields, files } = await upload_file_to_GCS(data)
    //#region
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
    if (!avatar_hash) {
        await file.makePublic()
        let avatar = file.publicUrl()
        fields = { ...fields, avatar: file.publicUrl(), avatar_hash }
    }

    ctx.files = files
    ctx.fields = fields
    return


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
}

async function _parse(ctx, formidableIns, promise) {
    return new Promise((resolve, reject) => {
        formidableIns.parse(ctx.req, async (err, fields, files) => {
            if (err) {
                console.log('formidable 解析發生錯誤')
                reject(err)
                return
            }
            if (!promise) {
                console.log('formidable 解析完成')
                resolve(field)
                return
            }
            try {
                let { field } = await promise
                console.log('upload file to GCS & formidable 解析完成')
                resolve(field)
                return
            } catch (e) {
                console.log('upload file to GCS 發生錯誤')
                reject(e)
                return
            }
        })
    })
}

const _gen_formidable = (file, promise) => {
    if (!file) {
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
        fileWriteStreamHandler(file) {
            let ws = file.createWriteStream({
                //  https://cloud.google.com/storage/docs/metadata#caching_data
                metadata: {
                    contnetType: 'image/jpeg',
                    cacheControl: 'no-store'
                }
            })
            promise = new Promise((resolve, reject) => {
                ws
                    .on('finish', () => resolve(0))
                    .on('error', reject)
            })
            return ws
        }
    })
}

async function parse(ctx, file) {
    let promise = null
    form = _gen_formidable(promise, file)
    return await _parse(ctx, form, promise)
}


async function upload_file_to_GCS(ctx, file) {
    let promise = ''
    let form = _gen_formidable(file, promise)
    return await _parse(ctx, form, promise)
}

module.exports = {
    upload_avatar_to_GCS,
    upload_blogImg_to_GCS
}