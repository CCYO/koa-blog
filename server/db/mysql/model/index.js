const seq = require('../seq')
const User = require('./User')
const Blog = require('./Blog')
const Comment = require('./Comment')
const IdolFans = require('./IdolFans')
const ArticleReader = require('./ArticleReader')
const MsgReceiver = require('./MsgReceiver')
const Img = require('./Img')
const BlogImg = require('./BlogImg')
const BlogImgAlt = require('./BlogImgAlt')
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
User.hasMany(Blog, { as: { singular: 'blog', plural: 'blogs' }, foreignKey: 'author_id', sourceKey: 'id' })
Blog.belongsTo(User, { as: 'author', foreignKey: 'author_id', targetKey: 'id', onDelete: 'CASCADE' })
//  Blog : Comment = 1 : N
Blog.hasMany(Comment, { as: { singular: 'reply', plural: 'replys' }, foreignKey: 'article_id', sourceKey: 'id' })
Comment.belongsTo(Blog, { as: 'article', foreignKey: 'article_id', targetKey: 'id', onDelete: 'CASCADE' })
//  User : Comment = 1 : N
User.hasMany(Comment, { as: { singular: 'comment', plural: 'comments' }, foreignKey: 'commenter_id', sourceKey: 'id' })
Comment.belongsTo(User, { as: 'commenter', foreignKey: 'commenter_id', targetKey: 'id', onDelete: 'CASCADE' })
//  Comment : Comment = 1 : N
Comment.hasMany(Comment, { as: { singular: 'commentChild', plural: 'commentChildren' }, foreignKey: 'pid', sourceKey: 'id' })   //  Comment_F
Comment.belongsTo(Comment, { as: 'commentParent', foreignKey: 'pid', targetKey: 'id', onDelete: 'CASCADE' })   //  Comment_T
//  SourceModel 作為 foreignKey 的來源，
//  as 是 TargetModel 的別名，
User.belongsToMany(User, { as: { singular: 'fans', plural: 'fansList' }, through: IdolFans, foreignKey: 'idol_id', targetKey: 'id' })
User.belongsToMany(User, { as: { singular: 'idol', plural: 'idols' }, through: IdolFans, foreignKey: 'fans_id', targetKey: 'id' })
Blog.belongsToMany(User, { as: { singular: 'reader', plural: 'readers' }, through: ArticleReader, foreignKey: 'article_id', targetKey: 'id' })
User.belongsToMany(Blog, { as: { singular: 'article', plural: 'articles' }, through: ArticleReader, foreignKey: 'reader_id', targetKey: 'id' })
Comment.belongsToMany(User, { as: { singular: 'receiver', plural: 'receivers' }, through: MsgReceiver, foreignKey: 'msg_id', targetKey: 'id' })
User.belongsToMany(Comment, { as: { singular: 'msg', plural: 'msgs' }, through: MsgReceiver, foreignKey: 'receiver_id', targetKey: 'id' })
//  Blog : BlogImg = 1 : N
Blog.hasMany(BlogImg, { foreignKey: 'blog_id', sourceKey: 'id' })
BlogImg.belongsTo(Blog, { foreignKey: 'blog_id', targetKey: 'id', onDelete: 'CASCADE' })
//  Img : BlogImg = 1 : N
Img.hasMany(BlogImg, { foreignKey: 'img_id', sourceKey: 'id' })
BlogImg.belongsTo(Img, { foreignKey: 'img_id', targetKey: 'id', onDelete: 'CASCADE' })
//  Blog : Img = M : N
Blog.belongsToMany(Img, { through: BlogImg, foreignKey: 'blog_id', targetKey: 'id' })
Img.belongsToMany(Blog, { through: BlogImg, foreignKey: 'img_id', targetKey: 'id' })
//  BlogImg : BlogImgImg = 1 : N
BlogImg.hasMany(BlogImgAlt, { foreignKey: 'blogImg_id', sourceKey: 'id' })
BlogImgAlt.belongsTo(BlogImg, { foreignKey: 'blogImg_id', targetKey: 'id', onDelete: 'CASCADE' })

module.exports = {
    seq,                        //  0322
    User, Blog, Comment,
    IdolFans, ArticleReader, MsgReceiver,
    Img, BlogImg, BlogImgAlt
}