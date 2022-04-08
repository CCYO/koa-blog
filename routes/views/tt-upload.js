/**
 * @description Router/Views user
 */
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const { resolve } = require('path')
const router = require('koa-router')()
const multer = require('@koa/multer')

const genCustomStorage = require('../../middleware/genCustomStorage')
const { api_check_login } = require('../../middleware/check_login')

const upload = multer({
    storage: genCustomStorage()
})

const uploadDist = multer({
    dest: resolve(__dirname, '../', '../', 'maybeHaveFile')
})

let uploadDir = resolve( __dirname , '..', '..', './myFile')

const tttt = async (ctx) => {
    return new Promise(
        (r, j) => {
            let i = 0
            let length = 0
            console.log('////')
            console.log('$readable => ', ctx.req.readable)
            console.log('$readableLength => ', ctx.req.readableLength)
            console.log('$readableFlowing => ', ctx.req.readableFlowing)
            if(!ctx.req.readable){
                console.log('GGG')
                return j(new Error('GGGGGGGGGGG 數據早沒了'))
            }
            ctx.req.on('data', async (chunk) => {
                i++
                length += chunk.length
                console.log('$ondata readableFlowing => ', ctx.req.readableFlowing)
                console.log(`chunk => ind: ${i} , size: ${chunk.length}, total: ${length}`)
            })
            ctx.req.on('end', async() => {
                console.log('$onend readableFlowing => ', ctx.req.readableFlowing)
                console.log('finish')
                ctx.req.pause()
                console.log('$onpause readableFlowing => ', ctx.req.readableFlowing)
                return r('ggg')
            })
            ctx.req.on('close', () => {
                console.log('$onclose readableFlowing => ', ctx.req.readableFlowing)
                console.log('finish')
            })
            ctx.req.on('error', async(err) => {
                console.log('err => ', err.stack)
                j(err)
            })
        }
    )
}

router.get('/view/tt-upload',
    async (ctx, next) => {
        await ctx.render('test-upload')
    }
)

/*
**** 方法1
**** Req >>> Server Dist >>> GCP
**** ex: koaBody
********
**** 方法2
**** Req >>> Server Dest >>> GCP
*/
router.post('/api/uploadSwitchToGCS', api_check_login, upload.any(), async (ctx, next) => {
    console.log('@@@ => ', ctx.request.files)
    console.log('@@@ => ', ctx.files)
    ctx.body = { errno: 0, data: 'ok'}
})

router.post('/api/uploadFromDistToGCS', api_check_login, uploadDist.any(), async (ctx, next) => {
    console.log('@@@ => ', ctx.request.files)
    console.log('@@@ => ', ctx.files)
    ctx.body = { errno: 0, data: 'ok'}
})

router.post('/api/upload', async (ctx, next) => {
    try{
        let { image } = ctx.request.files
        console.log('@@ => ', image)
        var rs = fs.createReadStream(image.path)
        
        let url 
        
        rs
        .pipe( file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg'
            }
        }))
        .on('finish', async ()=> {
            const aaa = await file.makePublic()
            url = file.publicUrl()
            console.log('sasa => ', aaa)
            console.log('url => ', url)
        })
        // var url = URL.createObjectURL(arrayBuffer)

        
        //console.log('@ ==> ', arrayBuffer.size)
        
        // console.log(`filename => ${filename}`)
        //let ws = fs.createWriteStream(filename)
        
        // ws.write(buffer)
        // ws.end()
        // ws.on('finish', () => console.log('write ok'))
        // ws.on('error', (e) => console.log(`write err => ${e.stack}`))
        // fs.writeFile(filename, buffer, (e) => console.log(' @@@ => ', e))
        



        ctx.body = { errno: 0, data: 'ok'}
        
    }catch(e){
        console.log('EEEEEEERRRRRRRR => ', e)
        ctx.body = { errno: 1, msg: 'NOK'}
    }
    
})

module.exports = router