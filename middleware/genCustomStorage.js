/**
 * @description custom Multer StorageEngine to GCS(Google Cloud Storage)
 */

const fs = require('fs')
const { resolve } = require('path')
const storage = require('../firebase/init')
const mime = require('mime-types')

//let PATH = 'tt/avatar.jpg'

function getDestination (req, file, cb) {
    cb(null, 'tt/avatar.jpg')
}
  
function MyCustomStorage (opts) {
    this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile (req, file, cb) {
    this.getDestination(req, file, function (err, path) {
      if (err) return cb(err)
  
      const bucket = storage.bucket()
      const buckFile = bucket.file(path)
      let outStream = buckFile.createWriteStream({
        metadata: {
            contentType: 'image/jepg',
        }
      })
  
      file.stream.pipe(outStream)
      outStream.on('error', cb)
      outStream.on('finish', async () => {
        await buckFile.makePublic()
        url = buckFile.publicUrl()
        let metadata = await buckFile.getMetadata()
        let [ { size } ] = metadata
        //  2st arg 會被傳入 req.files
        cb(null, {
            url,
            size,
            //  前端 formData upload 是以 Blob形式，預設 mimetype: application/octet-stream
            //  故要字形修改
            mimetype: mime.lookup(originalname)
        })
      })
    })
  }
  


// function MyCustomStorage(opt){
//     console.log('NEW---1')
//     if(!opt) return new Error('FXXK')
//     if(opt && opt.targetPath){
//         console.log('友唷-----------------------------', opt.targetPath)
//         PATH = opt.targetPath   
//     }
//     console.log('this => ', this)
// }

// //  req 不是 Node 的 ctx.request，而是 koa 重新包裝的 ctx.req
// MyCustomStorage.prototype._handleFile = (req, file, cb) => {
//     console.log('#this => ', this)
//     const {
//         fieldname,
//         originalname,
//         encoding,
//         mimetype,
//         size,
//         stream,
//         destination,
//         filename,
//         path,
//         buffer,
//         entries
//     } = file
//     console.log(...Object.entries(file))
//     console.log(
//         `
//         fieldname -> ${fieldname} \n
//         originalname -> ${originalname} \n
//         encoding -> ${encoding} \n
//         mimetype -> ${mimetype} \n
//         size -> ${size} \n
//         stream -> \n
//         Readable: ${ stream.readable } \n 
//         readableLength: ${stream.readableLength}\n
//         destination -> ${destination} \n
//         filename -> ${filename}\n
//         path -> ${path} \n
//         buffer -> ${buffer} \n
//         `
//     )
    
//     const bucket = storage.bucket()
//     const buckFile = bucket.file(PATH)
    
//     let outStream = buckFile.createWriteStream({
//         metadata: {
//             contentType: 'image/jepg',
//         }
//     })
//     file.stream
//         .pipe(outStream)
//         .on('error', cb)
//         .on('data', (chunk) => {
//             console.log(`chunk -> ${chunk.size}`)
//         })
//         .on('finish', async () => {
//             console.log(`Read OK`)
//         })
    
//     outStream.on('finish', async () => {
//         await buckFile.makePublic()
//         url = buckFile.publicUrl()
//         let metadata = await buckFile.getMetadata()
//         let [ { size } ] = metadata
//         //  2st arg 會被傳入 req.files
//         cb(null, {
//             url,
//             size,
//             //  前端 formData upload 是以 Blob形式，預設 mimetype: application/octet-stream
//             //  故要字形修改
//             mimetype: mime.lookup(originalname)
//         })
//     })
    
// }

MyCustomStorage.prototype._removeFile = (req, file, cb) => {
    console.log('NEW---3')
    fs.unlink(file.path, cb)
}

module.exports = (opt) => {
    return new MyCustomStorage(opt)
}

