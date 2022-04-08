/**
 * @description custom Multer StorageEngine to GCS(Google Cloud Storage)
 */

const fs = require('fs')
const { resolve } = require('path')
const storage = require('../firebase/init')

const PATH = 'tt20220408/avatar'

function MyCustomStorage(){
    console.log('NEW---1')
    this.getDestination = function(req, file, cb){ cb(null, PATH) } 
    console.log('this => ', this)
}

MyCustomStorage.prototype._handleFile = (req, file, cb) => {
    const {
        fieldname,
        originalname,
        encoding,
        mimetype,
        size,
        stream,
        destination,
        filename,
        path,
        buffer,
        entries
    } = file
    console.log(...Object.entries(file))
    console.log(
        `
        fieldname -> ${fieldname} \n
        originalname -> ${originalname} \n
        encoding -> ${encoding} \n
        mimetype -> ${mimetype} \n
        size -> ${size} \n
        stream -> \n
        Readable: ${ stream.readable } \n 
        readableLength: ${stream.readableLength}\n
        destination -> ${destination} \n
        filename -> ${filename}\n
        path -> ${path} \n
        buffer -> ${buffer} \n
        `
    )
    
    const bucket = storage.bucket('abc44561')
    const buckFile = bucket.file(PATH)

    let outStream = buckFile.createWriteStream({
        metadata: {
            contentType: 'image/jepg'
        }
    })
    file.stream
        .pipe(outStream)
        .on('error', cb)
        .on('data', (chunk) => {
            console.log(`chunk -> ${chunk.size}`)
        })
        .on('finish', async () => {
            console.log(`Read OK`)
        })
    
    outStream.on('finish', async () => {
        await buckFile.makePublic()
        url = buckFile.publicUrl()
        console.log('!@ => ', await buckFile.getMetadata())
        //  2st arg 會被傳入 req.files
        console.log(`outStream.writableLength -> }`)
        cb(null, {
            url,
            size: buckFile.size
        })
    })
    
}

MyCustomStorage.prototype._removeFile = (req, file, cb) => {
    console.log('NEW---3')
    fs.unlink(file.path, cb)
}

module.exports = (opt) => {
    return new MyCustomStorage(opt)
}

