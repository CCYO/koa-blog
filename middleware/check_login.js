/**
 * @description middleware validate login 
 */

const { ErrModel } = require('../model/index')
const { LOGIN: { NOT_LOGIN }} = require('../model/errRes')

const view_check_login = async (ctx, next) => {
    const { session: { user }} = ctx
    if(user){
        await next()
    }else{
        ctx.redirect(`/login?from=${encodeURIComponent(ctx.href)}`)
    }
    return
}

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