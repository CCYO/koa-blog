const Opts = require('../utils/seq_findOpts')
const Comment = require('../server/comment')

const { SuccModel } = require('../model')

const {
    createComment,
    setRelatedComment,
    deleteComment
} = require('../server/comment')

//  0228
async function findCommentsByBlogId(blog_id){
    let comments = await Comment.readCommentsForBlog(Opts.findCommentsByBlogId(blog_id))
    return new SuccModel({data: comments})
}

async function addComment({user_id, blog_id, html, p_id, author}){
    let newComment = await Comment.createComment({ user_id, blog_id, html, p_id, author})
    let [comment] = await Comment.readCommentsForBlog(Opts.findCommentById(newComment.id))
    //  找出討論串相關的使用者


    // let cacheNews = await setRelatedComment(json, { author })

    // let cache = { news: cacheNews, blog: [ blog_id ] }
    // let x = await readComment({ id: json.id })
    // console.log(x)
    // let [ comment ] = x
    return new SuccModel({data: comment})
}

async function removeComment({commentId, blog_id}){
    let res = await deleteComment({ commentId, blog_id })
    let cache = { blog: [blog_id] }
    // let cacheNews = await setRelatedComment(json, { author })

    // let cache = { news: cacheNews, blog: [ blog_id ] }
    // let [ comment ] = await readComment({ id: json.id })
    return new SuccModel(res, cache)
}

module.exports = {
    createComment,
    removeComment,

    addComment,
    findCommentsByBlogId //  0228
}