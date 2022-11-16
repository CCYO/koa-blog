const { BlogImg, BlogImgAlt } = require('../db/mysql/model')

const { init_blogImg } = require('../utils/init/blogImg')

async function createBlogImg({blog_id, img_id, name}){
    let blogImg = await BlogImg.create({blog_id, img_id, name})
    return init_blogImg(blogImg)
}

async function deleteBlogImg({listOfId}){
    let where = { id: listOfId }
    let row = await BlogImg.destroy({where})
    if(listOfId.length !== row){
        return false
    }
    return true
}

async function updateBlogImg({id, data}){
    let where = { id }
    let [ row ] = await BlogImg.update(data, { where })
    if(!row){
        return false
    }
    return true
}

async function updateBulkBlogImg(dataList){
    let promiseList = []
    dataList.reduce( async (initVal, {id, data}) => {
        initVal.push( await updateBlogImg({id, data}) )
        return initVal
    }, promiseList)
    
    let res = (await Promise.all(promiseList)).every(boo => boo)
    
    if(!res){
        return false
    }

    return true
}

async function readBlogImg( whereOps , needBlogImgAlt = false){
    let opts = { where : whereOps }
    if(needBlogImgAlt){
        opts.include = {
            model: BlogImgAlt
        }
    }
    let blogImg = await BlogImg.findOne(opts)
    let { id, img_id, BlogImgAlts } = blogImg.toJSON()
    let res = BlogImgAlts.map( imgAlt => ({ blogImgAlt_id: imgAlt.id, img_id, blogImg_id: id, alt: imgAlt.alt }) )
    return res
}

module.exports = {
    createBlogImg,
    deleteBlogImg,
    updateBlogImg,
    updateBulkBlogImg,
    readBlogImg
}