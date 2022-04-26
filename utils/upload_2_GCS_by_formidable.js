/**
 * @description middleware of upload to GCS by Formidable
 */

const formidable = require('formidable')

const storage = require('../firebase/init')

const upload_avatar_to_GCS = async(ctx) => {
    let { user: {id} } = ctx.session
    
    let filename = `${id}/avatar.jpg`
    let file = storage.bucket().file(filename)
    let promise_4_upload_from_formidable_2_GCS

    let formidableIns = _gen_formidable(file, promise_4_upload_from_formidable_2_GCS)

    await _parse(formidableIns, ctx, promise_4_upload_from_formidable_2_GCS)
    await file.makePublic()
    return file.publicUrl()
}

async function _parse(formidableIns, ctx, promise){
    return new Promise((resolve, reject) => {
        formidableIns.parse(ctx.req, async(err, fields, files) => {
            try{
                await promise
            }catch(e){
                reject(e)
                return
            }
            if(err){
                reject(err)
            }else{
                resolve(files)
            }
            return
        })
    })
}

const _gen_formidable = (file, promise) => {
    return formidable({fileWriteStreamHandler(){
        let ws = file.createWriteStream({
            contnetType: 'image/jpeg'
        })
        promise = new Promise((resolve, reject) => {
            ws
                .on('finish', resolve)
                .on('error', reject)
        })
        return ws
    }})
}

module.exports = upload_avatar_to_GCS