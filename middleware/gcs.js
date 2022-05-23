/**
 * @description middleware of upload to GCS by Formidable
 */

const { storage } = require('../firebase/init')

const { parse } = require('../utils/gcs')

async function parse_user_data(ctx, next) {
    let { avatar_hash } = ctx.params
    let file_gcs = (avatar_hash != 0) ? storage.bucket().file(`avatar/${avatar_hash}.jpg`) : null
    let [exist] = (avatar_hash != 0) ? await file_gcs.exists() : [false]
    //  正常修改
    let file =
        //  avatar不改
        (avatar_hash == 0) ? null :
            //  avatar要改，判斷GCS是否已有該檔
            (!exist) ? file_gcs : null

    ctx._my =
        //  若avatar不改 || GCS已有圖檔
        (!file) ? {} :
            //  若avatar有新檔要上傳GCS
            { file }

    let { fields, files } = await parse(ctx)
    if (fields.age) {
        fields.age = fields.age * 1
    }
    if (avatar_hash != 0) {
        fields = { ...fields, avatar_hash: file }
    }

    delete ctx._my

    ctx.request.body =
        //  若avatar不用改
        (avatar_hash == 0) ? { ...ctx.request.body, ...fields } :
            //  若avatar有需要改
            { ...ctx.request.body, ...fields, avatar: file_gcs.publicUrl(), avatar_hash }

    console.log('@ctx.request.body => ', ctx.request.body)

    await next()
}

module.exports = {
    parse_user_data
}