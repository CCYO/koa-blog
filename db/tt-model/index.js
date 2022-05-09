const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const BlogImg = require('./ralation-Blog&Img')

//  User : Blog = 1 : N
Blog.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id'})
User.hasMany(Blog, {foreignKey: 'user_id', sourceKey: 'id'})

//  Blog : Img = M : N
Blog.belongsToMany(Img, { through: BlogImg, foreignKey: 'blog_id', targetKey: 'id' })
Img.belongsToMany(Blog, { through: BlogImg, foreignKey: 'img_id', targetKey: 'id' })

//  找尋 Blog 內有哪些圖片
//  Blog → Imgname → img
//  Blog.findAll(
//     { where: blog_id },
//     include: {
//       model: Imgname,
//       include: {
//          model: Img,
//       }     
//     }
//  )


module.exports = {
    User, Blog, Img,BlogImg, seq
}