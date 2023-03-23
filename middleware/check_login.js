/**
 * @description middleware validate login 
 */
const {
    PERMISSION: {
        NOT_SELF,
        NOT_LOGIN   //  0228
    }
} = require('../model/errRes')

const {
    ErrModel    //  0228
} = require('../model')


//  0308
//  頁面必須是當前登入者所有
async function view_mustBeSelf(ctx, next) {
    let currentUser = ctx.session && ctx.session.user
    if (!currentUser) {
        await ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    } else if (ctx.params.userId * 1 !== currentUser.id) {
        await ctx.render('page404', new ErrModel(NOT_SELF))
    } else {
        await next()
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

/** Middleware 針對 API 請求，驗證是否登入  0228
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
const api_logining = async (ctx, next) => {
    const { session: { user } } = ctx
    if (user) {
        await next()
    } else {
        ctx.body = new ErrModel(NOT_LOGIN)
    }
    return
}

/** Middleware 針對 VIEW 請求，驗證是否登入
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
const view_logining = async (ctx, next) => {
    const { session: { user } } = ctx
    if (user) {
        await next()
    } else {
        ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    }
    return
}

module.exports = {
    view_logining,      //  0323
    
    view_mustBeSelf,    //  0308
    view_isSelf,        //  0228
    api_logining,       //  0228
}