const { BlogImg, BlogImgAlt } = require('../db/mysql/model')    //  0406
const { ErrRes, MyErr } = require('../model')                   //  0406
const Init = require('../utils/init')                           //  0406
//  0408
async function deleteList(opts) {
    try {
        let row = await BlogImg.destroy(opts)
        return row
    }catch(err){
        throw new MyErr({ ...ErrRes.BLOG_IMG.DELETE.ERR, err })
    }
}
//  0406
async function create(data) {
    try {
        let blogImg = await BlogImg.create(data)
        return Init.blogImg(blogImg)
    } catch (err) {
        throw new MyErr({ ...ErrRes.BLOG_IMG.CREATE.ERR, err })
    }
}
module.exports = {
    //  0408
    deleteList,
    //  0406
    create,
    updateBlogImg,
    updateBulkBlogImg
}






async function updateBlogImg(data) {
    let ins = await BlogImg.bulkCreate(data, {
        updateOnDuplicate: ['id', 'name', 'updatedAt']
    })
    if (ins.length !== data.length) {
        return []
    }
    Init.blogImgins
    return true
    let where = { id }
    let [row] = await BlogImg.update(data, { where })
    if (!row) {
        return false
    }
    return true
}

async function updateBulkBlogImg(dataList) {
    let promiseList = []
    dataList.reduce(async (initVal, { id, data }) => {
        initVal.push(await updateBlogImg({ id, data }))
        return initVal
    }, promiseList)

    let res = (await Promise.all(promiseList)).every(boo => boo)

    if (!res) {
        return false
    }

    return true
}
