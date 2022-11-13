const { resolve } = require('path')

const Koa = require('koa')
const session = require('koa-generic-session')
const views = require('koa-views')
const static = require('koa-static')
//  解析前端傳來的POST數據（存入ctx.request.body）
const bodyparser = require('koa-bodyparser')
//  打印請求跟響應的url
const logger = require('koa-logger')
//  提高終端顯示數據的可讀性
const json = require('koa-json')

//  連接redis-session
const store = require('./db/cache/redis/sessionStore')

//  連接redis
const { initCache } = require('./db/cache/redis/_redis')

const { ErrModel } = require('./model')
const { SERVER_ERR } = require('./model/errRes')

//  router - API
const apiUser = require('./routes/api/user')
const apiEditor = require('./routes/api/editor')
const apiNews = require('./routes/api/news')
const apiComment = require('./routes/api/comment')
//  router - VIEW
const viewUser = require('./routes/views/user')
const viewBlog = require('./routes/views/blog')
const viewAlbum = require('./routes/views/album')

const { isDev } = require('./utils/env')
const { REDIS_CONF } = require('./conf/constant')
const { cachePublic } = require('./middleware/cache')

const app = new Koa()

//  Middleware - 錯誤處理
//  負責捕捉意外的錯誤（預期可能發生的邏輯問題，已預先以ErrModel處理）
app.use(async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        if (isDev && error.hasOwnProperty('errno')) {	//  不希望發生的錯誤
            if (!/^\/api\//.test(ctx.path)) {   //  針對 VIEW 的錯誤
                ctx.body = error.msg
            } else {                              //  針對 API 的錯誤
                ctx.status = 500
                ctx.body = { errno: error.errno, msg: error.msg }
            }
        } else {    //  完全無預期的錯誤
            ctx.status = 500
            ctx.body = { errno: 9999, msg: '伺服器錯誤' }
        }
        ctx.app.emit('error', error, ctx)
        return
    }
})

initCache()

app.use(json())
app.use(logger())

//  靜態檔案
app.use(static(resolve(__dirname, 'public'), { maxage: 60 * 60 * 1000 }))

//  加密 session
app.keys = [REDIS_CONF.SESSION_KEY]

// 串連redis，實現session
app.use(session({
    key: 'blog.sid', //cookie name前綴
    prefix: 'blog.sess', //redis key前綴
    store
}))

app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))

app.use(views(__dirname + '/views', {
    extension: 'ejs'
}))

// Router - API
app.use(apiUser.routes(), apiUser.allowedMethods())
app.use(apiEditor.routes(), apiEditor.allowedMethods())
app.use(apiNews.routes(), apiNews.allowedMethods())
app.use(apiComment.routes(), apiComment.allowedMethods())

// Router - VIEW
app.use(viewUser.routes(), viewUser.allowedMethods())
app.use(viewBlog.routes(), viewBlog.allowedMethods())
app.use(viewAlbum.routes(), viewAlbum.allowedMethods())

app.on('error', (err, ctx) => {
    if (!err.hasOwnProperty('errno')) {   //  完全無預期的錯誤
        err.errno = 9999
        err.msg = '完全預期外的錯誤'
    }
    console.log(`
    @ custom ErrHandle Fire!!!! => \n
    err.errno => ${err.errno}\n
    err.msg => ${err.msg} \n
    err => \n `, err
    )
});

module.exports = app