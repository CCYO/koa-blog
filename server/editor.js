const { User, Blog } = require('../db/model')

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

module.exports = {
    createBlog,
    updateBlog
}