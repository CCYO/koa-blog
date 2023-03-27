const { Img } = require('../db/mysql/model')

const init = require('../utils/init')

async function readImg(opts){
    let img = await Img.findOne(opts)
    return init.img(img)
}

async function createImg({url, hash}){
    let img = await Img.create({url, hash})
    return init.img(img)
}


module.exports = {
    readImg,
    createImg
}