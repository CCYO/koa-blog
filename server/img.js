//  0406
const { ErrRes, MyErr } = require('../model')
//  0406
const init = require('../utils/init')
//  0406
const { Img } = require('../db/mysql/model')
//  0406
async function create(data) {
    try {
        let img = await Img.create(data)
        return init.img(img)
    } catch (err) {
        throw new MyErr({ ...ErrRes.IMG.CREATE.ERR, err })
    }
}
//  0406
async function read(opts) {
    let img = await Img.findOne(opts)
    return init.img(img)
}
module.exports = {
    //  0406
    create,
    //  0406
    read
}