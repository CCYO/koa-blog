/**
 * @description middleware of upload to GCS by Formidable
 */
const { parse } = require('../../utils/gcs')

async function user(ctx, next) {
    let resModel = await parse(ctx)
    if (resModel.errno) {
        return resModel
    }
    if (resModel.age) {
        resModel.age = Number.parseInt(res.age)
    }
    let res = { ...resModel, avatar_hash: ctx.query.hash }
    ctx.request.body = res
    await next()
    return
}

module.exports = {
    user
}