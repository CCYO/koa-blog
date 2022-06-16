const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const BlogImg = require('./relation-Blog&Img')
const User_Follow = require('./User_Follow')
const Blog_Follow = require('./Blog_Follow')
const News = require('./News')

/**
 * 1:1 與 1: N
 * onDelete: 'SET NULL'
 * onUpdate: 'CASCADE'
 * 
 * N:M
 * onDelete: 'CASCADE'
 * onUpdate: 'CASCADE'
 */


//  User : Blog = 1 : N
Blog.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id'})
User.hasMany(Blog, { foreignKey: 'user_id', sourceKey: 'id'})

//  Blog : Img = M : N
Blog.belongsToMany(Img, { through: BlogImg, foreignKey: 'blog_id', targetKey: 'id' })
Img.belongsToMany(Blog, { through: BlogImg, foreignKey: 'img_id', targetKey: 'id' })

//  SourceModel 作為 foreignKey 的來源，
//  as 是 TargetModel 的別名，
User.belongsToMany(User, { as: 'Idol', through: User_Follow, foreignKey: 'fans_id', targetKey: 'id'})
User.belongsToMany(User, { as: 'Fans', through: User_Follow, foreignKey: 'idol_id', targetKey: 'id'})
User_Follow.belongsTo(User, {as: 'Fans_of_User_Follow', foreignKey: 'fans_id', targetKey: 'id'})
User_Follow.belongsTo(User, {as: 'Idol_of_User_Follow', foreignKey: 'idol_id', targetKey: 'id'})
User.hasMany(User_Follow, {foreignKey: 'fans_id', targetKey: 'id'})
User.hasMany(User_Follow, {foreignKey: 'idol_id', targetKey: 'id'})

// Follow 上的 idol 有很多 blog
// Follow.hasMany(Blog, { foreignKey: 'user_id', targetKey: 'idol_id'})

Blog.belongsToMany(User, { as: 'Blog_of_Blog_Follow', through: Blog_Follow, foreignKey: 'blog_id', targetKey: 'id'})
User.belongsToMany(Blog, { as: 'Fans_of_Blog_Follow', through: Blog_Follow, foreignKey: 'fans_id', targetKey: 'id'})
Blog_Follow.belongsTo(Blog, { foreignKey: 'blog_id', targetKey: 'id'})
Blog_Follow.belongsTo(User, { foreignKey: 'fans_id', targetKey: 'id'})
Blog.hasMany(Blog_Follow, { foreignKey: 'blog_id', targetKey: 'id'})
User.hasMany(Blog_Follow, { foreignKey: 'fans_id', targetKey: 'id'})

Blog_Follow.hasMany(News, { foreignKey: 'news_id', sourceKey: 'id'})
User_Follow.hasMany(News, { foreignKey: 'news_id', sourceKey: 'id'})
News.belongsTo(Blog_Follow, { foreignKey: 'news_id', targetKey: 'id'})
News.belongsTo(User_Follow, { foreignKey: 'news_id', targetKey: 'id'})

module.exports = {
    User, Blog, Img, BlogImg, User_Follow, Blog_Follow, News, seq
}