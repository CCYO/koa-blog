const { resolve } = require('path')

const Koa = require('koa')
const session = require('koa-generic-session')
const views = require('koa-views')
const static = require('koa-static')
//  解析前端傳來的POST數據（存入koa.body）
const bodyparser = require('koa-bodyparser')
//  打印請求跟響應的url
const logger = require('koa-logger')
//  提高終端顯示數據的可讀性
const json = require('koa-json')

//  連接redis
const store = require('./db/cache/redis/sessionStore')
//  router - API
const apiUser = require('./routes/api/user')
const apiEditor = require('./routes/api/editor')
const apiNews = require('./routes/api/news')
const apiComment = require('./routes/api/comment')
//  router - VIEW
const viewUser = require('./routes/views/user')
const viewBlog = require('./routes/views/blog')

const { isDev } = require('./utils/env')
const { REDIS_CONF } = require('./conf/constant')

const app = new Koa()

//  Middleware - 錯誤處理
//  負責捕捉意外的錯誤（預期可能發生的邏輯問題，已預先以ErrModel處理）
app.use(async (ctx, next) => {
    try {
        await next()
        console.log(ctx.message)
    } catch (error) {
        let status = error.status || 500
        let message = error.message || null

        //  針對 VIEW 的錯誤
        if (!/^\/api\//.test(ctx.path)) {
            ctx.throw(status, message, error)
            return
        }
        //  針對 API 的錯誤
        ctx.app.emit('error', error, ctx)

        //  若是 DEV 環境
        if(isDev){
            ctx.body = { errno: status, msg: message }
        }
        return
    }
})

app.use(json())
app.use(logger())

//  靜態檔案
app.use(static(resolve(__dirname, 'public')))

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

// 應用的錯誤handle
app.on('error', (err, ctx) => {
    console.log('@觸發app.on(error)')
    console.log('@custom ErrHandle Fire!!!! => ', err)
});

module.exports = app