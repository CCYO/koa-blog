/**
 * @description middleware of upload to GCS by Formidable
 */

const { storage } = require('../db/firebase')

const { parse } = require('../utils/gcs')

const { GCS_ref: { AVATAR } } = require('../conf/constant')

async function parse_user_data(ctx, next) {
    //  avatar_hash = 0 代表沒有 avatar 圖檔，反之則有
    let { avatar_hash, ext } = ctx.query
    let ref = undefined
    if(avatar_hash){
        let filename = `${AVATAR}${avatar_hash}.jpg`
        let file_gcs = storage.bucket().file(filename)
        let [exist] = await file_gcs.exists()
        ref = exist ? undefined : file_gcs
    }

    let { fields } = await parse(ctx, ref)
    
    if (fields.age) {
        fields.age = fields.age * 1
    }
    if (avatar_hash) {
        ctx.request.body = { ...ctx.request.body, ...fields, avatar: ref.publicUrl(), avatar_hash }
    }else{
        ctx.request.body =  { ...ctx.request.body, ...fields }
    }

    await next()
}

module.exports = {
    parse_user_data
}