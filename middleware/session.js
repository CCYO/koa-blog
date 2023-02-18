const { SuccModel } = require('../model')


async function setLoginSession(ctx, next) {
    await next()
    let { errno, data } = ctx.body
    if (errno) {
        return
    }

    ctx.session.user = data
    console.log(`@ 設置 user/${data.id} 的 session.user`)

    if (!ctx.session.news) {
        console.log(`@ 初始化 user/${data.id} 的 session.news`)
        ctx.session.news = []
    }
}

async function removeLoginSession(ctx) {
    ctx.session = null
    ctx.body = new SuccModel('成功登出')
}

module.exports = {
    setLoginSession,
    removeLoginSession
}