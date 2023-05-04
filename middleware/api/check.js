//  0505
const { ErrRes, ErrModel } = require('../../model')
//  0505
async function mustBeAuthor(ctx, next){
    let { author_id } = ctx.request.body
    let user_id = ctx.session.user.id
    if( author_id !== user_id ){
        ctx.body = new ErrModel(ErrRes.PERMISSION.NOT_AUTHOR)
        return
    }
    await next()
}
//  0505
/** Middleware 針對 API 請求，驗證是否登入
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
async function login(ctx, next) {
    if (ctx.session.user) {
        await next()
    } else {
        ctx.body = new ErrModel(ErrRes.PERMISSION.NO_LOGIN)
    }
    return
}

module.exports = {
    //  0505
    mustBeAuthor,
    //  0505
    login
}