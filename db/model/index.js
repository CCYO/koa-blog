const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const BlogImg = require('./relation-Blog&Img')

const FollowPeople = require('./FollowPeople')

const FollowBlog = require('./FollowBlog')
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
User.belongsToMany(User, { as: 'FollowPeople_I', through: FollowPeople, foreignKey: 'fans_id', targetKey: 'id'})
User.belongsToMany(User, { as: 'FollowPeople_F', through: FollowPeople, foreignKey: 'idol_id', targetKey: 'id'})
// Follow_People.belongsTo(User, {as: 'People_Fans', foreignKey: 'fans_id', targetKey: 'id'})
// Follow_People.belongsTo(User, {as: 'People_Idol', foreignKey: 'idol_id', targetKey: 'id'})
// User.hasMany(User_Follow, {foreignKey: 'fans_id', targetKey: 'id'})
// User.hasMany(User_Follow, {foreignKey: 'idol_id', targetKey: 'id'})

// Follow 上的 idol 有很多 blog
// Follow.hasMany(Blog, { foreignKey: 'user_id', targetKey: 'idol_id'})

Blog.belongsToMany(User, { as: 'FollowBlog_F', through: FollowBlog, foreignKey: 'blog_id', targetKey: 'id'})
User.belongsToMany(Blog, { as: 'FollowBlog_B', through: FollowBlog, foreignKey: 'follower_id', targetKey: 'id'})
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
    
    FollowPeople,
    FollowBlog,
    
    News, seq
}