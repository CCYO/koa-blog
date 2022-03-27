const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
//const bodyparser = require('koa-bodyparser')

const koaBody = require('koa-body')

const logger = require('koa-logger')
const store = require('./cache/store')
const session = require('koa-generic-session')


const index = require('./routes/index')
const users = require('./routes/users')

const tt_upload = require('./routes/views/tt-upload')

const firebase_test = require('./routes/firebase-test')

const api__user = require('./routes/api/user')

const view__user = require('./routes/views/user')



// error handler
onerror(app)

app.keys = ['keys']

// middlewares
app.use(session({
  key: 'blog.sid', //cookie name前綴
  prefix: 'blog.sess', //redis key前綴
  store
}))

// app.use(bodyparser({
//   enableTypes:['json', 'form', 'text']
// }))

// app.use(koaBody({
//   multipart: true, // 支援檔案上傳
//   uploadDir: './myFile'
//   // formidable: {
//   //   maxFieldsSize: 2 * 1024 * 1024, // 最大檔案為2兆
//   //   multipart: true, // 是否支援 multipart-formdate 的表單
    
//   // }
// }));

app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

app.use(tt_upload.routes(), tt_upload.allowedMethods())

app.use(firebase_test.routes(), firebase_test.allowedMethods())

app.use(api__user.routes(), api__user.allowedMethods())

app.use(view__user.routes(), view__user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
