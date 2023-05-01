//  0501
async function isSelf(ctx, next) {
    let me = ctx.session.user ? ctx.session.user.id : undefined
    let currentUser = ctx.params.id * 1
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
    //  0501
    isSelf,
    //  0501
    login
}