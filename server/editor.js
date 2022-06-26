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
                attributes: ['id'],
                through: {
                    where: { fans_id: {[Op.ne]: data.user_id}}
                }
            }
        }
    })
    console.log('@@@ => ', blog)

    let fans_id = blog.User.Fans.map( fans => fans.dataValues.id )

    //  更新前，先撈出待確認資料
    let { show, showAt } = blog.toJSON()

    //  曾經公開過，後來隱藏，且現在又要再公開
    !show && showAt && data.show

    //  true : 隱藏 → 公開
    //  false : 公開 → 隱藏
    //  undefined : 無變動
    let hiddenOrShow =
        (!show && data.show) ? true :
        (show && !data.show) ? false : undefined

    //  這次更新是否要作 1st show
    let firstShow = !showAt && hiddenOrShow
    let notFirstShow = showAt && hiddenOrShow
    //  若是 1st show，設定showAt
    if(firstShow || notFirstShow){
        data.showAt = Date.now()
    }

    let [ row ] = await Blog.update( data, {
        where: { id: blog_id }
    })

    //  show 無變動，結束
    if(hiddenOrShow === undefined) return row

    //  1st show，通知 fans
    if(firstShow){  
        await blog.addFollower(fans_id)
    }
    
    //  公開 → 隱藏，直接更新blog的show就可以了

    //  非1st公開    
    if(notFirstShow){
        //  blog 固有 fans，且 Follow.confirm: false，若 blog.show 有變動，自然會得到通知

        //  找出是 author 現有粉絲，但未 follow 文章的人
        let followers_id = (await blog.getFollower()).map( follower => follower.dataValues.id )
        console.log('@fans_id => ', fans_id)
        console.log('@followers_id => ', followers_id)
        let newFollowers_id = fans_id.filter( id => !followers_id.includes(id) )
        console.log('@@newFollowers ==> ', newFollowers_id)
        //  加入 follow
        await blog.addFollower(newFollowers_id)
    }

    return row
}

async function createImg(data){
    let img = await Img.create(data)
    return { id: img.id, url: img.url, hash: img.hash }
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

async function deleteBlog(id){
    const row = await Blog.destroy({where: {id}})
    return row
}

module.exports = {
    createBlog,
    updateBlog,
    
    createImg,
    img_associate_blog,
    deleteBlogImg,
    
    createImg_associateBlog,
    deleteBlog
}