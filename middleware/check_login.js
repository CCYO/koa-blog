/**
 * @description middleware validate login 
 */
const { PERMISSION } = require('../model/errRes')   //  0404
const { ErrModel } = require('../model')    //  0404
//  0430
async function api_isAuthor(ctx, next){
    let { author_id } = ctx.request.body
    let user_id = ctx.session.user.id
    if( author_id !== user_id ){
        ctx.body = new ErrModel(PERMISSION.NOT_AUTHOR)
        return
    }
    await next()
}
//  0430
async function view_isAuthor(ctx, next){
    let author_id = ctx.request.query && ctx.request.query.author_id && ctx.request.query.author_id * 1
    let user_id = ctx.session.user.id
    if(author_id !== user_id){
        return await ctx.render('page404', new ErrModel(PERMISSION.NOT_AUTHOR))
    }
    await next()
}
//  0404
/** Middleware 針對 VIEW 請求，驗證是否登入
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
async function view_logining(ctx, next) {
    if (ctx.session.user) {
        await next()
    } else {
        ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    }
    return
}
//  0404
/** Middleware 針對 API 請求，驗證是否登入
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
async function api_logining(ctx, next) {
    if (ctx.session.user) {
        await next()
    } else {
        ctx.body = new ErrModel(PERMISSION.NO_LOGIN)
    }
    return
}
//  0228
async function view_isSelf(ctx, next) {
    let me = ctx.session.user ? ctx.session.user.id : undefined
    let currentUser = ctx.params.id * 1
    //  若是自己的ID，跳轉到個人頁面
    if (me === currentUser) {
        return ctx.redirect('/self')
    }
    await next()
}

module.exports = {
    //  0430
    api_isAuthor,
    //  0430
    view_isAuthor,
    //  0404
    view_logining,
    //  0404
    api_logining,
    //  0228
    view_isSelf,
    view_mustBeSelf,
}
//  0308
//  頁面必須是當前登入者所有
async function view_mustBeSelf(ctx, next) {
    let currentUser = ctx.session && ctx.session.user
    if (!currentUser) {
        await ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    } else if (ctx.params.userId * 1 !== currentUser.id) {
        await ctx.render('page404', new ErrModel(PERMISSION.NOT_SELF))
    } else {
        await next()
    }
    return
}




