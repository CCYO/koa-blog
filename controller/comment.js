const { CACHE: { TYPE: { PAGE, NEWS, API }} } = require('../conf/constant')
const Opts = require('../utils/seq_findOpts')
const Comment = require('../server/comment')

const { SuccModel, ErrModel } = require('../model')

const {
    createComment,
    setRelatedComment,
    deleteComment
} = require('../server/comment')
const { Op } = require('sequelize')
const FollowComment = require('../server/followComment')

//  0228
async function findCommentsByBlogId(blog_id) {
    let comments = await Comment.readCommentsForBlog(Opts.findCommentsByBlogId(blog_id))
    return new SuccModel({ data: comments })
}

async function addComment({ user_id, blog_id, html, p_id, author }) {
    let cache = { [PAGE.API]: [blog_id] }
    //  找出相關comment
    let comments
    //  根評論 p_id = null
    if (!p_id) {
        comments = await Comment.readComment(Opts.findRootCommentsByBlogId(blog_id))
        //  子留言串comment_id = p_id
    } else {
        comments = await Comment.readComment(Opts.findChidCommentsByPid(p_id))
    }

    //  撈出目前相關commenterId
    let followerIds = comments.map(({ user }) => user.id)
    //  author也是commenter
    if(author !== user_id ){
        followerIds.push(author)
    }
    cache[NEWS] = [followerIds]
    //  撈出目前相關commentId
    let targetIds = comments.map(({ id }) => id)
    console.log('@targetIds => ', targetIds)
    //  撈出FollowComment內，targets相符的所有條目
    let followComments = await FollowComment.readFollowComment(Opts.findFollowCommentsByTargets(targetIds))
    console.log('@followComments => ', followComments)
    let { needCreate, needUpdate } = followComments.reduce((acc, { id, follower_id }) => {
        if (follower_id === author) {
            return acc
        }
        //  不在followers_in_followComment之中，卻存在此次相關commenter.followerIds行列之中，必須為該commenter建立FollowComment
        if (!followerIds.includs(follower_id)) {
            acc.needCreate.push({ follower_id })
            //  存在followers_in_followComment之中，且存在此次相關commenter.followerIds行列之中，必須為該followComment更新數據
        } else {
            acc.needUpdate.push({ id, confirm: false })
        }
        return acc
    }, { needCreate: [], needUpdate: [] })

    console.log(needCreate, needUpdate)
    return 

    // //  創建Comment
    // let newComment = await Comment.createComment({ user_id, blog_id, html, p_id, author })
    // if(!newComment){
    //     throw new Error('創建Comment失敗')
    // }
    // let [comment] = await Comment.readCommentsForBlog(Opts.findCommentById(newComment.id))

    // let { id, createdAt } = comment
    // //  創建FollowComment
    // let resCreate = FollowComment.createFollowComments( needCreate.map( item => ({...item, id, createdAt }) ) )
    // if(!resCreate){
    //     return new ErrModel()
    // }
    // let resUpdate = FollowComment.updateFollowComments( needUpdate.map( item => ({...item, target_id: id, updatedAt: createdAt})))
    // if(!resUpdate){
    //     return new ErrModel()
    // }

    return new SuccModel({ data: comment, cache })

    //  要通知誰
    //  有pid => 舊留言串 => 文章作者 + 串主 + 串中所有留言者
    //  查詢串頭 => pid = id
    //  查詢串中留言者 => pid = pid
    //  更新 FollowComment
    //  查詢所有留言串 => 
    //  無pid => 新留言串 => 文章作者

    //  是否通知文章作者
    //  作者 != 留言者


    // let newComment = await Comment.createComment({ user_id, blog_id, html, p_id, author })
    // let [comment] = await Comment.readCommentsForBlog(Opts.findCommentById(newComment.id))
    //  找出討論串相關的使用者


    // let cacheNews = await setRelatedComment(json, { author })

    // let cache = { news: cacheNews, blog: [ blog_id ] }
    // let x = await readComment({ id: json.id })
    // console.log(x)
    // let [ comment ] = x
   
}

async function removeComment({ commentId, blog_id }) {
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