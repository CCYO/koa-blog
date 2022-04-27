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
    console.log('ctx.files => ', ctx.files)
    console.log('ctx.file => ', ctx.file)
    await file.makePublic()
    /**
     * [
     *   {
     *     kind: 'storage#objectAccessControl',
     *     object: '2/avatar.jpg',
     *     generation: '1650967655043642',
     *     id: 'gfb20220419.appspot.com/2/avatar.jpg/1650967655043642/allUsers',
     *     selfLink: 'https://www.googleapis.com/storage/v1/b/gfb20220419.appspot.com/o/2%2Favatar.jpg/acl/allUsers',
     *     bucket: 'gfb20220419.appspot.com',
     *     entity: 'allUsers',
     *     role: 'READER',
     *     etag: 'CLqk9eS9sfcCEAM='
     *   }
     * ]
     */
    const publicUrl = file.publicUrl()
    const [ { md5Hash } ] = await file.getMetadata
    /**
     * [ 
     *   {
     *     kind: 'storage#object',
     *     id: 'gfb20220419.appspot.com/2/avatar.jpg/1650967655043642',
     *     selfLink: 'https://www.googleapis.com/storage/v1/b/gfb20220419.appspot.com/o/2%2Favatar.jpg',
     *     mediaLink: 'https://storage.googleapis.com/download/storage/v1/b/gfb20220419.appspot.com/o/2%2Favatar.jpg?generation=1650967655043642&alt=media',
     *     name: '2/avatar.jpg',
     *     bucket: 'gfb20220419.appspot.com',
     *     generation: '1650967655043642',
     *     metageneration: '2',
     *     contentType: 'image/jpeg',
     *     storageClass: 'STANDARD',
     *     size: '9861',
     *     md5Hash: 'OjojAbdEsRJSsCrX7/6MCA==',
     *     crc32c: '82ub8w==',
     *     etag: 'CLqk9eS9sfcCEAI=',
     *     timeCreated: '2022-04-26T10:07:35.050Z',
     *     updated: '2022-04-26T10:07:35.151Z',
     *     timeStorageClassUpdated: '2022-04-26T10:07:35.050Z'
     *   },
     *   PassThrough { xxx }
     * ]
     */
	
    return { publicUrl, md5Hash }
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