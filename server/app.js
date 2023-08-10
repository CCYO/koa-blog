const webpack = require('webpack')
const koaMount = require('koa-mount')
const koaConvert = require('koa-convert')
const koaViews = require('@ladjs/koa-views');
const webpackDevMiddleware = require('./middleware/_webpackDev')
const webpackHotMiddleware = require('koa-webpack-hot-middleware')  //  警告：沒有TS檔

require('dotenv').config()
//  設定環境變量，以 ~/.env 作為設定檔
const CONFIG = require('../build/config')
const isDev = process.env.NODE_ENV === 'development'
let webpackConfig = require('../build/webpack.dev.config')
let compiler = webpack(webpackConfig)
let viewRoot

const { ErrRes } = require('./model')

const { resolve } = require('path')

const Koa = require('koa')
const session = require('koa-generic-session')
// const views = require('koa-views')
const koaStatic = require('koa-static')
//  解析前端傳來的POST數據（存入ctx.request.body）
const bodyparser = require('koa-bodyparser')
//  打印請求跟響應的url
const logger = require('koa-logger')
//  提高終端顯示數據的可讀性
const json = require('koa-json')
//  連接redis-session
const store = require('./db/cache/redis/sessionStore')
const { seq } = require('./db/mysql/model')
//  router - API
const apiUser = require('./routes/api/user')
const apiEditor = require('./routes/api/editor')
const apiNews = require('./routes/api/news')
const apiComment = require('./routes/api/comment')
const apiAlbum = require('./routes/api/album')
//  router - VIEW
const viewUser = require('./routes/views/user')
const viewBlog = require('./routes/views/blog')
const viewAlbum = require('./routes/views/album')
const viewSquare = require('./routes/views/square')
const viewErrPage = require('./routes/views/errPage')

const { isProd } = require('./utils/env')
const { REDIS_CONF } = require('./conf/constant')

const app = new Koa()

//  Middleware - 錯誤處理
//  負責捕捉意外的錯誤（預期可能發生的邏輯問題，已預先以ErrModel處理）
app.use(async (ctx, next) => {
    try {
        await seq.transaction(async (t) => {
            await next()
        })
    } catch (error) {
        ctx.status = 500
        let isAPI = /^\/api\//.test(ctx.path)
        let isMyErr = error.isMyErr
        let responseErr = error
        if (!isMyErr || error.err) {
            /* 完全無預期的錯誤，或是捕捉到第三方模塊生成的錯誤 */
            ctx.app.emit('error', error, ctx)
            responseErr = ErrRes.SERVER_ERR
            //  公版錯誤提醒
        }
        if (isProd) {
            //  let responseErr = { errno: '44444', msg: '伺服器未預期的錯誤' }
        }
        if (isAPI) {
            ctx.body = responseErr
        } else {
            await ctx.render('page404', responseErr)
        }
        return
    }
})

app.use(json())
app.use(logger())

if (isDev) {
	// 用 webpack-dev-middleware 启动 webpack 编译
	app.use(
		webpackDevMiddleware(compiler, {
			publicPath: webpackConfig.output.publicPath,
			stats: {
				colors: true
			}
		})
	)
	// 使用 webpack-hot-middleware 支持热更新
	app.use(
		koaConvert(
			webpackHotMiddleware(compiler, {
				publicPath: webpackConfig.output.publicPath,
				noInfo: true,
				reload: true
			})
		)
	)
	// 指定开发环境下的静态资源目录
	// app.use(koaMount(
	// 	CONFIG.PUBLIC_PATH,
	// 	koaStatic(resolve(__dirname, '../src'), { maxage: 60 * 60 * 1000 })
	// ))
	viewRoot = resolve(__dirname, '../dist/views')
} else {
	viewRoot = resolve(__dirname, `./${CONFIG.BUILD.VIEW}`)
}
//  view
app.use(koaViews(viewRoot, { extension: 'ejs', map: { ejs: 'ejs' }, viewExt: 'ejs' }))
//  靜態檔案
app.use(koaMount(
    CONFIG.PUBLIC_PATH,
    koaStatic(resolve(__dirname, `./assets`), { maxage: 60 * 60 * 1000 })
))



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

// app.use(views(__dirname + '/views', {
//     extension: 'ejs'
// }))

// Router - API
app.use(apiUser.routes(), apiUser.allowedMethods())
app.use(apiEditor.routes(), apiEditor.allowedMethods())
app.use(apiNews.routes(), apiNews.allowedMethods())
app.use(apiComment.routes(), apiComment.allowedMethods())
app.use(apiAlbum.routes(), apiAlbum.allowedMethods())

// Router - VIEW
app.use(viewUser.routes(), viewUser.allowedMethods())
app.use(viewBlog.routes(), viewBlog.allowedMethods())
app.use(viewAlbum.routes(), viewAlbum.allowedMethods())
app.use(viewSquare.routes(), viewSquare.allowedMethods())
app.use(viewErrPage.routes(), viewErrPage.allowedMethods())

app.on('error', (error, ctx) => {
    console.log(`@ 發生未預期的錯誤!!!!`)
    console.log(`@ MyErr : \n`, error)
    console.log(`\n -------------------------------------------- \n`)
    console.log(`@ 原生錯誤 error : \n`, error.err)
});

module.exports = app