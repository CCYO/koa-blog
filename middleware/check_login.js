/**
 * @description middleware validate login 
 */
const { ErrRes, ErrModel } = require('../model')    //  0404
//  0430
async function api_isAuthor(ctx, next){
    let { author_id } = ctx.request.body
    let user_id = ctx.session.user.id
    if( author_id !== user_id ){
        ctx.body = new ErrModel(ErrRes.PERMISSION.NOT_AUTHOR)
        return
    }
    await next()
}


module.exports = {
    //  0430
    api_isAuthor,
    view_mustBeSelf,
}
//  0308
//  頁面必須是當前登入者所有
async function view_mustBeSelf(ctx, next) {
    let currentUser = ctx.session && ctx.session.user
    if (!currentUser) {
        await ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    } else if (ctx.params.userId * 1 !== currentUser.id) {
        await ctx.render('page404', new ErrModel(ErrRes.PERMISSION.NOT_SELF))
    } else {
        await next()
    }
    return
}