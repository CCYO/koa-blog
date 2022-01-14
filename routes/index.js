const router = require('koa-router')()


let count = 0

router.get('/', async (ctx, next) => {
  if(ctx.session && !ctx.session.count && ctx.session.count !== 0 ){
    ctx.session.count = count
    console.log('@@ => ', ctx.session.count)
    return ctx.body = ctx.session.count
  }
  console.log('@@@@ => ', ctx.session.count)
  ctx.session.count ++
  return ctx.body = ctx.session.count
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
