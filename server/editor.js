const { User, Blog, Img } = require('../db/model')

/**
 * 
 * @param {String} title blog標題
 * @param {Number} userId userId 
 * @returns Model Blog ins
 */
async function createBlog(title, userId){
    let user = await User.findByPk(userId)
    console.log('@user => ', user)
    let blog = await user.createBlog({title})
    console.log('@blog => ', blog)
    return blog
}

async function updateBlog(data, blog_id){
    let [ raw ] = await Blog.update( data, {
        where: { id: blog_id }
    })
    return raw
}

async function readImg(data){
    let img = await Img.findOne({ where: data })
    if(!img){
        return null
    }
    return { id: img.id, url: img.url, hash: img.hash }
}

async function createImg(data){
    let img = await Img.create(data)
    return { id: img.id, url: img.url, hash: img.hash }
}

async function img_associate_blog(img_id, blog_id){
    let img = await Img.findByPk(img_id)
    return await img.addBlog(blog_id)
}

module.exports = {
    createBlog,
    updateBlog,
    readImg,
    createImg,
    img_associate_blog
}