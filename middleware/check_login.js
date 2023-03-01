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
    SuccModel,

    ErrModel    //  0228
} = require('../model')

//  0228
const view_check_isMe = async (ctx, next) => {
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
const api_check_login = async (ctx, next) => {
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
const view_check_login = async (ctx, next) => {
    const { session: { user } } = ctx
    if (user) {
        await next()
    } else {
        ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    }
    return
}





const api_check_isMe = async (ctx, next) => {
    const { session: { user } } = ctx
    if (!user) {
        ctx.body = new ErrModel(NOT_LOGIN)
        return
    }
    let { user_id } = ctx.request.body
    if( user_id !== user.id ){
        ctx.body = new ErrModel(NOT_ME)
        return
    }
    await next()
}

module.exports = {
    view_check_login,
    
    api_check_isMe,

    view_check_isMe,    //  0228
    api_check_login,    //  0228
}