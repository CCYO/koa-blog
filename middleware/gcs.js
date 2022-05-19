/**
 * @description middleware of upload to GCS by Formidable
 */

const formidable = require('formidable')

const storage = require('../firebase/init')

const { findImg_And_associate_blog } = require('../server/editor')
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
    let fn = (!blog_id) ? upload_avatar_to_GCS : upload_blogImg_to_GCS

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
/*
    const { img_hash: hash, blog_id } = ctx.params
    const { id } = ctx.user

    // 判斷SQL有沒有同圖的紀錄
    let res = await findImg_And_associate_blog({ hash }, blog_id)

    //  有，SQL OK，GCS OK
    ctx.field = { ...res }


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
    */
}

async function parse_user_data(ctx, next) {
    let { id } = ctx.session.user
    let { avatar_hash } = ctx.params
    let file_gcs = ( avatar_hash != 0 ) ? storage.bucket().file(`avatar/${avatar_hash}.jpg`) : null
    let [exist] = ( avatar_hash != 0 ) ? await file_gcs.exists() : [false]
    //  正常修改
    let file =
        //  avatar不改
        (avatar_hash == 0) ? null :
        //  avatar要改，判斷GCS是否已有該檔
        (!exist) ? file_gcs : null

    ctx._my = 
        //  若avatar不改 || GCS已有圖檔
        ( !file ) ? {} :
        //  若avatar有新檔要上傳GCS
        { file }

    let { fields, files } = await parse(ctx)
    if(fields.age){
        fields.age = fields.age * 1
    }
    if(avatar_hash != 0){
        fields = {...fields, avatar_hash: file}
    }
    
    delete ctx._my

    ctx.request.body = 
        //  若avatar不用改
        ( avatar_hash == 0 ) ? { ...ctx.request.body, ...fields } :
        //  若avatar有需要改
        { ...ctx.request.body, ...fields, avatar: file_gcs.publicUrl(), avatar_hash }
    
    console.log('@ctx.request.body => ', ctx.request.body)

    await next()
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
                resolve({fields, files})
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
                resolve({fields, files})
                return
            } catch (e) {
                console.log('upload file to GCS 發生錯誤')
                reject(e)
                return
            }
            console.log('正規的 formdable CB--------- over')
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
    console.log('定義了ㄇ?')
    return await _parse(ctx, form)
}


async function upload_file_to_GCS(ctx, file) {
    let promise = ''
    let form = _gen_formidable(file, promise)
    return await _parse(ctx, form, promise)
}

module.exports = {
    parse_user_data,
    upload_blogImg_to_GCS
}