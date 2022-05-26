const { User, Blog, Img, BlogImg} = require('../db/model')

/**
 * 
 * @param {String} title blog標題
 * @param {Number} userId userId 
 * @returns Model Blog ins
 */
async function createBlog(title, userId){
    let user = await User.findByPk(userId)
    let blog = await user.createBlog({title})
    return blog
}

async function updateBlog(data, blog_id){
    let blog = await Blog.findByPk(blog_id)
    let blog_json = blog.toJSON()

    let updateConfirm = false
    if((!blog_json.show && data.show) || (blog_json && !data.show)){
        updateConfirm = true
    }

    let [ row ] = await Blog.update( data, {
        where: { id: blog_id }
    })

    //  若文章公開，給粉絲發訊息
    if(updateConfirm){
        let idol = await User.findByPk(data.user_id)
        let fans = await idol.getFans()
        fans.forEach( async (f) => await f.updateBlogNews(blog_id))
    }

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