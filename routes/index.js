const router = require('koa-router')()

const session = require('../cache/store');

let count = 0

router.get('/', async (ctx, next) => {
  if(ctx.session && ctx.session.count == null){
    ctx.session.count = count
    return ctx.body = ctx.session.count
  }
  console.log('@@@@ => ', ctx.session.count)
  ctx.session.count ++
  return ctx.body = ctx.session.count
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
