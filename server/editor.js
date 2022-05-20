const { User, Blog, Img, BlogImg } = require('../db/model')

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

async function updateBlog(data, id){
    let [ row ] = await Blog.update( data, {
        where: { id }
    })
    return row
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

async function readImg_associateBlog(img_data, blog_id){
    let img = await Img.findOne({where: {...img_data}})
    console.log('@img => ', img)
    if(img){
        let [{ dataValues: { id: blogImg_id }}] = await img.addBlog(blog_id)
        return { blogImg_id, id: img.id, url: img.url, hash: img.hash }
    }
    return null
}

async function createImg_associateBlog(img_data, blog_id){
    let img = await Img.create({...img_data})
    let [{ dataValues: { id: blogImg_id }}] = await img.addBlog(blog_id)
    console.log('@blogImg_id => ', blogImg_id)
    return { blogImg_id, id: img.id, url: img.url, hash: img.hash }
}

async function createImg_And_associate_blog(img_data, blog_id){
    let img = await Img.create(img_data)
    img.addBlog
}


async function img_associate_blog(img_id, blog_id){
    let img = await Img.findByPk(img_id)
    let [ { dataValues: { id } } ] = await img.addBlog(blog_id)
    return id
}

async function deleteBlogImg(id_arr){
    let row = await BlogImg.destroy({where: { id: id_arr }})
    if(id_arr.length === row){
        return true
    }else{
        return false
    }
}

module.exports = {
    createBlog,
    updateBlog,
    readImg,
    createImg,
    img_associate_blog,
    deleteBlogImg,
    readImg_associateBlog,
    createImg_associateBlog
}