const { BLOGIMG: { REMOVE_ERR ,CREATE_ERR, UPDATE_ERR } } = require('../model/errRes')  //  0326
const { SuccModel, ErrModel } = require('../model') //0326
const BlogImg = require('../server/blogImg')    //  0326

//  0326
async function removeBlogImg(blogImg_id){
    let ok = await BlogImg.deleteBlogImg(blogImg_id)
    if(!ok){
        return new ErrModel(REMOVE_ERR)
    }
    return new SuccModel()
}

//  0326
async function createBlogImg({ blog_id, img_id, name}){
    let blogImg = await BlogImg.createBlogImg({ blog_id, img_id, name })
    if(!blogImg){
        return new ErrModel(CREATE_ERR)
    }
    return new SuccModel({ data: blogImg })
}


async function modifyBlogImg({ blog_id, name, blogImg_id }){
    let ok = await BlogImg.updateBlogImg({ id: blogImg_id, data: {name}})
    if(!ok){
        return new ErrModel(UPDATE_ERR)
    }
    console.log('成功')
    return new SuccModel(null, { blog: [blog_id] })
}

module.exports = {
    removeBlogImg,  //  0326
    createBlogImg,  //  0326
    modifyBlogImg
}