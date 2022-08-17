/**
 * @description middleware of upload to GCS by Formidable
 */

const { storage } = require('../db/firebase')

const { parse } = require('../utils/gcs')

const { ErrModel, SuccModel } = require('../model')
const { UPDATE: { AVATAR_FORMAT_ERR } } = require('../model/errRes')

const { GCS_ref: { AVATAR } } = require('../conf/constant')



async function parse_user_data(ctx, next) {    

    let res = await parse(ctx, ref)

    if(!res){
        ctx.body = new ErrModel(AVATAR_FORMAT_ERR)
        return
    }

    if(res.age){
        res.age *= 1
    }
    res = {...res, avatar_hash: ctx.query.hash}
    ctx.body = new SuccModel(res)
    return

    let { hash, ext } = ctx.query ? ctx.query : {}
    let ref = undefined
    
    if(hash){
        if(ext !== 'jpg' && ext !== 'png'){
            ctx.body = new ErrModel(AVATAR_FORMAT_ERR)
            return
        }
        let filename = `${AVATAR}/${hash}.${ext}`
        let file_gcs = storage.bucket().file(filename)
        let [exist] = await file_gcs.exists()
        console.log('@exist => ', exist)
        ref = exist ? undefined : file_gcs
    }
    
    let { fields } = await parse(ctx, ref)
    
    if (fields.age) {
        fields.age = fields.age * 1
    }
    if (hash) {
        ctx.request.body = { ...ctx.request.body, ...fields, avatar: ref.publicUrl(), avatar_hash: hash }
    }else{
        ctx.request.body =  { ...ctx.request.body, ...fields }
    }

    await next()
}

module.exports = {
    parse_user_data
}