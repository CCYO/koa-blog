const IdolFans = require('./IdolFans')
const seq = require('../seq')

const User = require('./User')
const Blog = require('./Blog')
const Img = require('./Img')
const Comment = require('./Comment')
const BlogImg = require('./relation-Blog&Img')
const BlogImgAlt = require('./BlogImgAlt')
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
Blog.belongsTo(User, { as: 'author', foreignKey: 'user_id', targetKey: 'id', onDelete: 'CASCADE' })
User.hasMany(Blog, { as: 'blogs', foreignKey: 'user_id', sourceKey: 'id'})

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
Comment.belongsTo(Blog, { as: 'article', foreignKey: 'blog_id', targetKey: 'id', onDelete: 'CASCADE'})
Blog.hasMany(Comment, { as: 'replys', foreignKey: 'blog_id', sourceKey: 'id'})

//  User : Comment = 1 : N
Comment.belongsTo(User, { as: 'commenter', foreignKey: 'user_id', targetKey: 'id', onDelete: 'CASCADE' })
User.hasMany(Comment, { as: 'comments', foreignKey: 'user_id', sourceKey: 'id'})

//  Comment : Comment = 1 : N
Comment.belongsTo(Comment, { as: 'parentComment', foreignKey: 'p_id', targetKey: 'id', onDelete: 'CASCADE' })   //  Comment_T
Comment.hasMany(Comment, { as: 'childComments', foreignKey: 'p_id', sourceKey: 'id'})   //  Comment_F

//  SourceModel 作為 foreignKey 的來源，
//  as 是 TargetModel 的別名，
User.belongsToMany(User, { as: 'idols', through: IdolFans, foreignKey: 'follow', targetKey: 'id'})
User.belongsToMany(User, { as: 'fans', through: IdolFans, foreignKey: 'target', targetKey: 'id'})

Blog.belongsToMany(User, { as: 'reader', through: PubScr, foreignKey: 'blog_id', targetKey: 'id'})    //  FollowBlog_F
User.belongsToMany(Blog, { as: 'publications', through: PubScr, foreignKey: 'follower_id', targetKey: 'id'})    //  FollowBlog_B

User.belongsToMany(Comment, { as: 'messages', through: FollowComment, foreignKey: 'follower_id',targetKey: 'id'})    //  FollowComment_T
Comment.belongsToMany(User, { as: 'receivers', through: FollowComment, foreignKey: 'comment_id',targetKey: 'id'}) //  FollowComment_F

module.exports = {
    IdolFans,                   //  0322
    seq,                        //  0322

    User, Blog, Img, Comment,
    BlogImg, BlogImgAlt,
    PubScr: FollowBlog,
    FollowComment,
    News, 
}