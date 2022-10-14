const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const Comment = require('./Comment')
const BlogImg = require('./relation-Blog&Img')
const BlogImgAlt = require('./BlogImgAlt')

const FollowPeople = require('./FollowPeople')
const FollowBlog = require('./FollowBlog')
const FollowComment = require('./FollowComment')

const News = require('./News')

/**
 * 1:1 與 1: N
 * onDelete: 'SET NULL'
 * onUpdate: 'CASCADE'
 * 
 * 1: N
 * onDelete: 'NO ACTION' → 我觀察到的，網路資料卻都說是 SET NULL
 * onUpdate: 'CASCADE'
 * 
 * N:M
 * onDelete: 'CASCADE'
 * onUpdate: 'CASCADE'
 */


//  User : Blog = 1 : N
Blog.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id', onDelete: 'CASCADE' })
User.hasMany(Blog, { foreignKey: 'user_id', sourceKey: 'id'})

//  Blog : BlogImg = 1 : N
BlogImg.belongsTo(Blog, { foreignKey: 'blog_id', targetKey: 'id', onDelete: 'CASCADE' })
Blog.hasMany(BlogImg, { foreignKey: 'blog_id', sourceKey: 'id'})

//  Img : BlogImg = 1 : N
BlogImg.belongsTo(Img, { foreignKey: 'img_id', targetKey: 'id', onDelete: 'CASCADE' })
Img.hasMany(BlogImg, { foreignKey: 'img_id', sourceKey: 'id'})

//  Blog : Img = M : N
Blog.belongsToMany(Img, { through: BlogImg, foreignKey: 'blog_id', targetKey: 'id' })
Img.belongsToMany(Blog, { through: BlogImg, foreignKey: 'img_id', targetKey: 'id' })

//  BlogImg : BlogImgImg = 1 : N
BlogImgAlt.belongsTo(BlogImg, { foreignKey: 'blogImg_id', targetKey: 'id', onDelete: 'CASCADE' })
BlogImg.hasMany(BlogImgAlt, { foreignKey: 'blogImg_id', sourceKey: 'id'})

//  Blog : Comment = 1 : N
Comment.belongsTo(Blog, { foreignKey: 'blog_id', targetKey: 'id', onDelete: 'CASCADE'})
Blog.hasMany(Comment, { foreignKey: 'blog_id', sourceKey: 'id'})

//  User : Comment = 1 : N
Comment.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id', onDelete: 'CASCADE' })
User.hasMany(Comment, { foreignKey: 'user_id', sourceKey: 'id'})

//  Comment : Comment = 1 : N
Comment.belongsTo(Comment, { as: 'Comment_T', foreignKey: 'p_id', targetKey: 'id', onDelete: 'CASCADE' })
Comment.hasMany(Comment, { as: 'Comment_F', foreignKey: 'p_id', sourceKey: 'id'})

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

User.belongsToMany(Comment, { as: 'FollowComment_T', through: FollowComment, foreignKey: 'follower_id',targetKey: 'id'})
Comment.belongsToMany(User, { as: 'FollowComment_F', through: FollowComment, foreignKey: 'comment_id',targetKey: 'id'})

module.exports = {
    User, Blog, Img, Comment,
    BlogImg, BlogImgAlt,
    
    FollowPeople,
    FollowBlog,
    FollowComment,
    
    News, seq
}