const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const BlogImg = require('./relation-Blog&Img')
const Follow = require('./relation-Follow')
const Blog_Fans = require('./Blog_Fans')

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


//  SourceModel 作為 foreignKey 的來源，
//  as 是 TargetModel 的別名，
User.belongsToMany(User, { as: 'Idol', through: Follow, foreignKey: 'fans_id', targetKey: 'id'})
User.belongsToMany(User, { as: 'Fans', through: Follow, foreignKey: 'idol_id', targetKey: 'id'})
Follow.belongsTo(User, {as: 'Fans_of_Follow', foreignKey: 'fans_id', targetKey: 'id'})
Follow.belongsTo(User, {as: 'Idol_of_Follow', foreignKey: 'idol_id', targetKey: 'id'})
User.hasMany(Follow, {foreignKey: 'fans_id', targetKey: 'id'})
User.hasMany(Follow, {foreignKey: 'idol_id', targetKey: 'id'})
// Follow.belongsTo(User, { foreignKey: 'idol_id', targetKey: 'id'})
// Follow.belongsTo(User, { foreignKey: 'fans_id', targetKey: 'id'})

//  Follow 上的 idol 有很多 blog
// Follow.hasMany(Blog, { foreignKey: 'user_id', targetKey: 'idol_id'})

Blog.belongsToMany(User, { as: 'Follower', through: Blog_Fans, foreignKey: 'blog_id', targetKey: 'id'})
User.belongsToMany(Blog, { as: 'BlogNews', through: Blog_Fans, foreignKey: 'fans_id', targetKey: 'id'})
Blog_Fans.belongsTo(Blog, { foreignKey: 'blog_id', targetKey: 'id'})
Blog_Fans.belongsTo(User, { foreignKey: 'fans_id', targetKey: 'id'})
Blog.hasMany(Blog_Fans, { foreignKey: 'blog_id', targetKey: 'id'})
User.hasMany(Blog_Fans, { foreignKey: 'fans_id', targetKey: 'id'})
module.exports = {
    User, Blog, Img, BlogImg, Follow, Blog_Fans, seq
}