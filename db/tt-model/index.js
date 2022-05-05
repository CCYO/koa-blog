const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const Imgname = require('./Imgname')
const BlogImgname = require('./ralation-Blog&Imgname')

//  User : Blog = 1 : N
Blog.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id'})
User.hasMany(Blog, {foreignKey: 'user_id', sourceKey: 'id'})

//  Img : Imgname = 1 : N
Imgname.belongsTo(Img, { foreignKey: 'img_id', targetKey: 'id'})
Img.hasMany(Imgname, {foreignKey: 'img_id', sourceKey: 'id'})
//  Blog : Imgname = M : N
Blog.belongsToMany(Imgname, { through: BlogImgname, foreignKey: 'blog_id', targetKey: 'id'})
Imgname.belongsToMany(Blog, { through: BlogImgname, foreignKey: 'imgname_id', targetKey: 'id'})

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
    User, Blog, Img, Imgname, BlogImgname, seq
}