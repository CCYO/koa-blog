const { SuccModel } = require('../model')   //  0228

//  移除登入者session   0228
async function removeLoginSession(ctx) {
    ctx.session = null
    ctx.body = new SuccModel('成功登出')
}

//  設置登入者session   0228
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

//  取得登入者session  0228
async function getLoginSession(ctx){
    console.log('@取得登入資料')
    let data = ctx.session.user
    ctx.body = new SuccModel({data})
}

module.exports = {
    removeLoginSession, //  0228
    setLoginSession,    //  0228
    getLoginSession,    //  0228
}