const { Op } = require('sequelize')

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
    let blog = await Blog.findByPk(blog_id, {
        include: {
            model: User,
            attributes: ['id'],
            include: {
                model: User,
                as: 'Fans',
                where: {
                    id: {[Op.ne]: data.user_id}
                },
                attributes: ['id']
            }
        }
    })
    let fans = blog.User.Fans

    let { show, showAt } = blog.toJSON()

    //  true : 隱藏 → 公開
    //  false : 公開 → 隱藏
    //  undefined : 無變動
    let hiddenOrShow =
        (!show && data.show) ? true :
        (show && !data.show) ? false : undefined
    
    //  這次更新是否要作 1st show
    let firstShow = !showAt && hiddenOrShow
    
    //  若是 1st show，設定showAt
    if(firstShow){
        data.showAt = Date.now()
    }

    let [ row ] = await Blog.update( data, {
        where: { id: blog_id }
    })

    //  show 無變動，結束
    if(hiddenOrShow === undefined) return row

    if(firstShow){  //  1st show，通知 fans
        await blog.addFollower(fans)
    }else if(!hiddenOrShow){   //  隱藏
        await blog.updateFollower({show: false})
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