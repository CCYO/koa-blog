/**
 * @description middleware validate login 
 */

const { SuccModel, ErrModel } = require('../model')
const { PERMISSION: { NOT_LOGIN, NOT_SELF } } = require('../model/errRes')

const { init_user } = require('../utils/init')

/** Middleware 針對 API 請求，驗證是否登入
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



async function getMe(ctx){
    ctx.body = new SuccModel(init_user(ctx.session.user))
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

async function view_check_isMe(ctx, next) {
    let me = ctx.session.user ? ctx.session.user.id : undefined
    let currentUser = ctx.params.id * 1

    //  若是自己的ID，跳轉到個人頁面
    if (me === currentUser) {
        return ctx.redirect('/self')
    }
    await next()
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
    view_check_isMe,
    api_check_login,
    api_check_isMe,
    getMe
}