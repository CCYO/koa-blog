const { updateBlogImg } = require('../server/blogImg')

const { SuccModel, ErrModel } = require('../model')
const { BLOGIMG } = require('../model/errRes')
async function modifyBlogImg({ name, blogImg_id }){
    let ok = await updateBlogImg({ id: blogImg_id, data: {name}})
    if(!ok){
        return new ErrModel(BLOGIMG.UPDATE_ERR)
    }
    console.log('成功')
    return new SuccModel()
}

module.exports = {
    modifyBlogImg
}