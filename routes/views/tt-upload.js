/**
 * @description Router/Views user
 */
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const { resolve } = require('path')
const getRawBody = require('raw-body')

const storage = require('../../firebase/init')

let uploadDir = resolve( __dirname , '..', '..', './myFile')

const koaBody = require('koa-body')({
    multipart: true, // 支援檔案上傳
     formidable: {
         uploadDir
     }
})



const router = require('koa-router')()

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

const setTime = async (ctx, next) => {
    console.log('setTime ready...')
    return new Promise( r => {
        setTimeout( () => {
            console.log('setTime finish...')
            r()
        }, 1000)
    }).then( next )
}

const getBody = async (ctx, next) => {
    console.log('getRawBody start')
    console.log(`ctx.req.headers['content-length'] => ${ctx.req.headers['content-length']}`)
    console.log(`ctx.req.readable => ${ctx.req.readable}`)
    console.log(`ctx.req.readableFlowing => ${ctx.req.readableFlowing}`)
    console.log(`ctx.req.readableEnded => ${ctx.req.readableEnded}`)
    //const rawBody = await getRawBody(ctx.req, { length: ctx.req.headers['content-length']})
    const rawBody = await getRawBody(ctx.req)
    console.log('getRowBody end')
    await next()
}

router.get('/view/tt-upload',
    async (ctx, next) => {
        await setTime(ctx, next)
        //console.log('????')
        //await next()
    },
    async (ctx, next) => {
        await ctx.render('test-upload')
        await next()
    }
)

router.post('/tt-www',
    async (ctx, next) => {
        console.log('test ing ... 1')
        await tttt(ctx)
        await next()
    },
    async (ctx, next) => {
        console.log('test ing ... 2')
        await tttt(ctx)
        await next()
    },
    async (ctx, next) => {
        try{
            await tttt(ctx)
            ctx.body = { errno: 0, data: 'ok'}
        }catch(e){
            console.log('123 => ', e)
            ctx.body = { errno: 1, msg: 'err'}
        }
})

router.post('/tt-json', koaBody, async (ctx, next) => {
    console.log(ctx.body)
    ctx.body = 'tt-json'
})

router.post('/api/tt-upload', koaBody, async (ctx, next) => {
    try{
        let { image } = ctx.request.files
        console.log('@@ => ', image)
        var rs = fs.createReadStream(image.path)
        const bucket = storage.bucket('abc44561')
        const file = bucket.file('image.jpg')
        let url 
        //var ws = fs.createWriteStream( resolve(uploadDir, './myjpg.jpg'))
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