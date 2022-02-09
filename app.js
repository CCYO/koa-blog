const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const store = require('./cache/store')
const session = require('koa-generic-session')


const index = require('./routes/index')
const users = require('./routes/users')

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

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
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

app.use(api__user.routes(), api__user.allowedMethods())

app.use(view__user.routes(), view__user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
