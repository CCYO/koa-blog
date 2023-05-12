//  0504
const { ErrRes, ErrModel } = require('../../model')
//  0504
async function mustBeOwner(ctx, next){
    let author_id = ctx.request.query && ctx.request.query.owner_id && ctx.request.query.owner_id * 1
    let user_id = ctx.session.user.id
    if(author_id !== user_id){
        return await ctx.render('page404', new ErrModel(ErrRes.PERMISSION.NOT_OWNER))
    }
    await next()
}
//  0501
async function isSelf(ctx, next) {
    let me = ctx.session.user ? ctx.session.user.id : undefined
    let currentUser = ctx.params.user_id * 1
    //  若是自己的ID，跳轉到個人頁面
    if (me === currentUser) {
        return ctx.redirect('/self')
    }
    await next()
}
//  0501
/** Middleware 針對 VIEW 請求，驗證是否登入
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
 async function login(ctx, next) {
    if (ctx.session.user) {
        await next()
    } else {
        ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    }
    return
}

module.exports = {
    //  0504
    mustBeOwner,
    //  0501
    isSelf,
    //  0501
    login
}