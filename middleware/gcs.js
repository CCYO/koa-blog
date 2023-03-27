/**
 * @description middleware of upload to GCS by Formidable
 */

const { storage } = require('../db/firebase')

const { parse } = require('../utils/gcs')

const { ErrModel, SuccModel } = require('../model')
const { UPDATE: { AVATAR_FORMAT_ERR } } = require('../model/errRes')

const { GCS_ref: { AVATAR } } = require('../conf/constant')



async function parse_user_data(ctx, next) {    
    let resModel = await parse(ctx)
    if(resModel.errno){
        return resModel
    }
    if(resModel.age){
        resModel.age = Number.parseInt(res.age)
    }
    let res = {...resModel, avatar_hash: ctx.query.hash}
    ctx.request.body = res
    await next()
    return
}

module.exports = {
    parse_user_data
}