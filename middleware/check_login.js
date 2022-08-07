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
    api_check_login
}