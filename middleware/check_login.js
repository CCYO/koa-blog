/**
 * @description middleware validate login 
 */

const { ErrModel } = require('../model')
const { LOGIN: { NOT_LOGIN }} = require('../model/errRes')

/** Middleware 針對 VIEW 請求，驗證是否登入
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
const view_check_login = async (ctx, next) => {
    const { session: { user }} = ctx
    if(user){
        await next()
    }else{
        ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    }
    return
}

async function view_check_isMe (ctx, next){
    let me = ctx.session.user ? ctx.session.user.id : undefined
    let currentUser = ctx.params.id * 1

    //  若是自己的ID，跳轉到個人頁面
    if ( me === currentUser) {
        return ctx.redirect('/self')
    }
    await next()
}

/** Middleware 針對 API 請求，驗證是否登入
 * @param {*} ctx 
 * @param {function} next 
 * @returns {promise<null>}
 */
const api_check_login = async (ctx, next) => {
    const { session: {user} } = ctx
    if(user){
        await next()
    }else{
        ctx.body = new ErrModel(NOT_LOGIN)
    }
    return
}

module.exports = {
    view_check_login,
    view_check_isMe,
    api_check_login
}