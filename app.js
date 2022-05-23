const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')

const bodyparser = require('koa-bodyparser')
// const koaBody = require('koa-body')({
//   multipart: true, // 支援檔案上傳
//    formidable: {
//        uploadDir
//    }
// })

const logger = require('koa-logger')
const store = require('./cache/store')
const session = require('koa-generic-session')

const index = require('./routes/index')
const users = require('./routes/users')

const tt_upload = require('./routes/views/tt-upload')

const upload_to_GCS = require('./routes/api/upload-to-GCS')

const api__user = require('./routes/api/user')
const api__blog_editor = require('./routes/api/editor')
const api__GFB = require('./routes/api/GFB')


const view__user = require('./routes/views/user')
const view__blog = require('./routes/views/blog')



// error handler
//onerror(app)

//  custom error handle
//  負責捕捉意外的錯誤（預期可能發生的邏輯問題，已預先以ErrModel處理）
app.use( async(ctx, next) => {
  try {
    await next()
  }catch(error){
    let status = error.status || 500
    let message = error.message || null

    if(/^\/api\//.test(ctx.path)){
      ctx.app.emit('error', error, ctx)
      ctx.body = { errno: status, msg: message}
      return
    }    
    
    ctx.throw(status, message, error.stack)
  }
});

app.keys = ['keys']

// middlewares
app.use(session({
  key: 'blog.sid', //cookie name前綴
  prefix: 'blog.sess', //redis key前綴
  store
}))

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

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

app.use(upload_to_GCS.routes(), upload_to_GCS.allowedMethods())

app.use(api__user.routes(), api__user.allowedMethods())
app.use(api__blog_editor.routes(), api__blog_editor.allowedMethods())
app.use(api__GFB.routes(), api__GFB.allowedMethods())

app.use(view__user.routes(), view__user.allowedMethods())
app.use(view__blog.routes(), view__blog.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.log('@觸發app.on(error)')
  console.log('@custom ErrHandle Fire!!!! => ', err)
});

module.exports = app
