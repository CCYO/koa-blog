const fs = require('fs')
const stream = require('stream')
const { resolve } = require('path')

let uploadDir = resolve(__dirname, '..', '..', './myFile')

const router = require('koa-router')()
const koaBody = require('koa-body')({
    multipart: true, // 支援檔案上傳
    formidable: {
        uploadDir
    }
})

const Multer = require('@koa/multer')
const mime = require('mime')

const storage = require('../../firebase/init')
const { api_check_login } = require('../../middleware/check_login')
const { Stream } = require('stream')

const uploadDist = Multer({
    dest: resolve(__dirname, '../', '../', 'maybeHaveFile')
})

router.post('/api/upload_by_MulterStorage_to_GCS',
    Multer({ storage: Multer.memoryStorage() }).any(),
    async (ctx, next) => {
        console.log('accross Multer.memoryStorage >>>')
        console.log('ctx.request.files >>> ', ctx.request.files)
        console.log('ctx.request.file >>> ', ctx.request.file)
        /**
         * {
         *   fieldname(formData.key),
         *   originalname,
         *   encoding,
         *   mimetype(根據originalname),
         *   buffer(Buffer)
         * }
         */
         console.log('ctx.req.files >>> ', ctx.req.files)
        console.log('ctx.req.file >>> ', ctx.req.file)
        // undefined
        console.log('ctx.files >>> ', ctx.files)
        console.log('ctx.file >>> ', ctx.file)
        // 同 ctx.request.file

        let filename = 'avatar.jpg'

        let file_from_GCS = storage.bucket().file(filename)
        let rs = new stream.PassThrough().end(ctx.file.buffer)
        let ws = file_from_GCS.createWriteStream({
            metadata: {
                contentType: 'image/jpeg'
            }
        })

        let publicUrl = await upload_to_GCS()

        ctx.body = { errno: 0, data: { publicUrl } }

        function upload_to_GCS() {
            return new Promise((resolve, reject) => {
                rs
                    .pipe(ws)
                    .on('finish', async () => {
                        const res_api = await file_from_GCS.makePublic()
                        console.log('GCS File.makePublic 的 res_api => ', res_api)
                        /**
                         * [{
                         *     kind, object, generation, id, selfLink, bucket, entity, role, etag
                         * }]
                         */

                        let publicUrl = file_from_GCS.publicUrl()
                        console.log('GCS File.PublicUrl 的 RV => ', publicUrl)
                        resolve(publicUrl)
                    })
                    .on('error', err => {
                        console.log('Upload From Koa to GCS , Error => ', err)
                        reject(err)
                    })
            })
        }

        ctx.body = 'ok'

})

//  Req FormData(Blob) >>> koa-body >>> Server Dist >>> GCP
router.post('/api/upload_by_Blob_in_FormData', koaBody, async (ctx, next) => {
    let files = ctx.request.files
    console.log('koa-body >>> ctx.request.files => ', files)
    /**
     * {
     *    <FormData.key> : File {
     *      size(bytes),
     *      path(存放處),
     *      name(取自FromData,默認值"Blob"),
     *      type(mime格式,,由name分析),
     *      hash
     *    }
     * }
     */

    let filename = 'avatar.jpg'
    let file_from_GCS = storage.bucket().file(filename)

    let publicUrl = await upload_from_Koa_to_GCS()
    await fs.promises.unlink(files.image.path)

    ctx.body = { errno: 0, data: { publicUrl } }

    function upload_from_Koa_to_GCS() {
        return new Promise((resolve, reject) => {
            fs.createReadStream(files.image.path)
                .pipe(file_from_GCS.createWriteStream({
                    metadata: {
                        contentType: 'image/jpeg'
                    }
                }))
                .on('finish', async () => {
                    const res_api = await file_from_GCS.makePublic()
                    console.log('GCS File.makePublic 的 res_api => ', res_api)
                    /**
                     * [{
                     *     kind, object, generation, id, selfLink, bucket, entity, role, etag
                     * }]
                     */

                    let publicUrl = file_from_GCS.publicUrl()
                    console.log('GCS File.PublicUrl 的 RV => ', publicUrl)
                    resolve(publicUrl)
                })
                .on('error', err => {
                    console.log('Upload From Koa to GCS , Error => ', err)
                    reject(err)
                })
        })
    }
})

//  Req FormData(File) >>> koa-body >>> Server Dist >>> GCP
router.post('/api/upload_by_File_in_FormData', koaBody, async (ctx, next) => {
    let files = ctx.request.files
    console.log('koa-body >>> ctx.request.files => ', files)
    /**
     * {
     *    <FormData.key> : File {
     *      size(bytes),
     *      path(存放處),
     *      name(取自FromData,默認值"Blob"),
     *      type(mime格式,,由name分析),
     *      hash
     *    }
     * }
     */

    let filename = 'avatar.jpg'
    let file_from_GCS = storage.bucket().file(filename)

    let publicUrl = await upload_from_Koa_to_GCS()

    await fs.promises.unlink(files.image.path)

    ctx.body = { errno: 0, data: { publicUrl } }

    function upload_from_Koa_to_GCS() {
        return new Promise((resolve, reject) => {
            fs.createReadStream(files.image.path)
                .pipe(file_from_GCS.createWriteStream({
                    metadata: {
                        contentType: 'image/jpeg'
                    }
                }))
                .on('finish', async () => {
                    const res_api = await file_from_GCS.makePublic()
                    console.log('GCS File.makePublic 的 res_api => ', res_api)
                    /**
                     * [{
                     *     kind, object, generation, id, selfLink, bucket, entity, role, etag
                     * }]
                     */

                    let publicUrl = file_from_GCS.publicUrl()
                    console.log('GCS File.PublicUrl 的 RV => ', publicUrl)
                    resolve(publicUrl)
                })
                .on('error', err => {
                    console.log('Upload From Koa to GCS , Error => ', err)
                    reject(err)
                })
        })
    }
})

module.exports = router