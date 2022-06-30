const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const BlogImg = require('./relation-Blog&Img')

const Follow_People = require('./Follow_People')

const Follow_Blog = require('./Follow_Blog')
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
User.belongsToMany(User, { as: 'Follow_People_I', through: Follow_People, foreignKey: 'fans_id', targetKey: 'id'})
User.belongsToMany(User, { as: 'Follow_People_F', through: Follow_People, foreignKey: 'idol_id', targetKey: 'id'})
// Follow_People.belongsTo(User, {as: 'People_Fans', foreignKey: 'fans_id', targetKey: 'id'})
// Follow_People.belongsTo(User, {as: 'People_Idol', foreignKey: 'idol_id', targetKey: 'id'})
// User.hasMany(User_Follow, {foreignKey: 'fans_id', targetKey: 'id'})
// User.hasMany(User_Follow, {foreignKey: 'idol_id', targetKey: 'id'})

// Follow 上的 idol 有很多 blog
// Follow.hasMany(Blog, { foreignKey: 'user_id', targetKey: 'idol_id'})

Blog.belongsToMany(User, { as: 'Follow_Blog_B', through: Follow_Blog, foreignKey: 'blog_id', targetKey: 'id'})
User.belongsToMany(Blog, { as: 'Follow_Blog_F', through: Follow_Blog, foreignKey: 'follow_id', targetKey: 'id'})
// Blog_Follow.belongsTo(Blog, { foreignKey: 'blog_id', targetKey: 'id'})
// Blog_Follow.belongsTo(User, { foreignKey: 'fans_id', targetKey: 'id'})
// Blog.hasMany(Blog_Follow, { foreignKey: 'blog_id', targetKey: 'id'})
// User.hasMany(Blog_Follow, { foreignKey: 'fans_id', targetKey: 'id'})

// Blog_Follow.hasMany(News, { foreignKey: 'news_id', sourceKey: 'id'})
// User_Follow.hasMany(News, { foreignKey: 'news_id', sourceKey: 'id'})
// News.belongsTo(Blog_Follow, { foreignKey: 'news_id', targetKey: 'id'})
// News.belongsTo(User_Follow, { foreignKey: 'news_id', targetKey: 'id'})

module.exports = {
    User, Blog, Img, BlogImg, 
    Follow_People,
    
    Follow_Blog, News, seq
}