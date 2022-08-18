const { Img } = require('../../db/mysql/model')

function init_img(img) {
    if(!img){
        return undefined
    }
    if (img instanceof Array) {
        let res = []

        img.forEach(item => {
            res.push(_init_img(item))
        })

        return res
    }

    return _init_img(img)
}

function _init_img(img) {
    let json_img = img.toJSON ? img.toJSON() : img

    const { id, hash, url } = json_img

    return { id, hash, url }
}

module.exports = {
    init_img
}