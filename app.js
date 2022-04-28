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

const view__user = require('./routes/views/user')



// error handler
//onerror(app)

app.use( async(ctx, next) => {
  try {
    await next()
  }catch(err){
    console.log('handle err => ', err)
    console.log('custom ErrHandle Fire!!!!')
    let status = err.status || 500
    let msg =
      (err.message) ? err.message :
      (status === 500) ? 'SERVER ERR' :
      '我不知道'
    console.log(`status => ${status}`)
    console.log(`msg => ${msg}`)
    ctx.body =
      (status === 404) ? "404 PAGE" :
      (status === 500) ? { errno: 1, msg } :      
      { errno: 1, msg: "我不知道"}
  }
  
  //console.error('server error', err, ctx)
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

app.use(view__user.routes(), view__user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  ctx.body =
  (ctx.status === 500) ? { errno: 1, msg: 'Server錯誤'} : 
  (ctx.status === 404) ? "404 PAGE" :
  { errno: 1, msg: "我不知道", err}
  console.error('server error', err, ctx)
});

module.exports = app
