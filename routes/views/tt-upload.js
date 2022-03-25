/**
 * @description Router/Views user
 */

const fs = require('fs')
const { resolve } = require('path')

console.log( resolve( __dirname , '../', '../', './myFile' , 'img.jpg'))
const router = require('koa-router')()

router.get('/view/tt-upload', async (ctx, next) => {
    await ctx.render('test-upload')
})

router.post('/api/tt-upload', async (ctx, next) => {
    try{
        let { img: arrayBuffer } = ctx.request.body
        
        console.log(ctx.request.file, ctx.request.files, ctx.request.body)
        buffer = Buffer.from(arrayBuffer) 
        let filename = resolve( __dirname , '..', '..', './myFile' , 'img.jpg')
        console.log(`filename => ${filename}`)
        let ws = fs.createWriteStream(filename)
        let res = await ws.write(buffer)
        ctx.body = { errno: 0, data: 'ok'}
    }catch(e){
        console.log('EEEEEEERRRRRRRR => ', e)
        ctx.body = { errno: 1, msg: 'NOK'}
    }
    
})

module.exports = router