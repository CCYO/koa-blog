const { SuccModel } = require('../model')

async function login(ctx, next) {
    await next()
    let { errno, data } = ctx.body
    if (errno) {
        return
    }

    ctx.session.user = data
    console.log(`@ 設定 user/${data.id} session`)

    if (!ctx.session.news) {
        ctx.session.news = []
    }
}

async function logout(ctx, next) {
    ctx.session = null
    ctx.body = new SuccModel('成功登出')
}

module.exports = {
    login,
    logout
}