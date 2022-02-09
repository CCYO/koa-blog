/**
 * @description middleware validate login 
 */

const view_check_login = async (ctx, next) => {
    const { session: { user }} = ctx
    if(user){
        await next()
    }else{
        ctx.redirect(`/login?from=${encodeURIComponent(ctx.path)}`)
    }
    return
}

module.exports = view_check_login