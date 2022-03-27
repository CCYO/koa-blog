/**
 * @description Router/Views user
 */
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const { resolve } = require('path')

const storage = require('../../firebase/init')

let uploadDir = resolve( __dirname , '..', '..', './myFile')

const koaBody = require('koa-body')({
    multipart: true, // 支援檔案上傳
     formidable: {
         uploadDir,
        //  onFileBegin(formName, file){
        //      console.log('formName => ', formName)
        //      console.log('file => ', file)
        //      file.filepath = uploadDir + '/abc.jpg'
        //  }
     }
})

const router = require('koa-router')()

router.get('/view/tt-upload', async (ctx, next) => {
    await ctx.render('test-upload')
})

router.post('/api/tt-upload', koaBody, async (ctx, next) => {
    try{
        let { image } = ctx.request.files
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