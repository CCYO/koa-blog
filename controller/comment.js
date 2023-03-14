const Controller_FollowComment = require('./followComment')
const { CACHE: { TYPE: { PAGE, NEWS, API } } } = require('../conf/constant')
const Opts = require('../utils/seq_findOpts')
const Comment = require('../server/comment')

const { SuccModel, ErrModel } = require('../model')

const {
    createComment,
    deleteComment
} = require('../server/comment')
const FollowComment = require('../server/followComment')

//  0228
async function findCommentsByBlogId(blog_id) {
    let comments = await Comment.readCommentsForBlog(Opts.findCommentsByBlogId(blog_id))
    return new SuccModel({ data: comments })
}

async function addComment({ commenter_id, blog_id, html, p_id, author_id }) {
    
    //  找出相關comment
    let relatedComments = await Comment.readComment(Opts.Comment.findRelatedComments({blog_id, p_id}))
    //  撈出相關comments的commenters(不含curCommenter)
    let relatedCommenterIds = relatedComments.map(({ user }) => {
        if (user.id === commenter_id) {
            return null
        } 
        return user.id
    }).filter(commenterId => commenterId)
    //  author也是相關commenter
    if (author_id !== commenter_id) {
        relatedCommenterIds.push(author_id)
    }
    //  刪去重複的commenterId
    relatedCommenterIds = [ ...new Set(relatedCommenterIds)]
    //  撈出目前相關commentId
    let relatedCommentIds = relatedComments.map(({ id }) => id)
    //  撈出FollowComment內，target_id符合relactiveCommentIds的所有條目
    let { data: followComments } = await Controller_FollowComment.findItemsByTargetsAndExcludeTheFollowers({comment_ids: relatedCommentIds, follower_ids: [author_id]})
    console.log('@followComments => ', followComments)
    let acculumator = { create: [], update: [] }
    if (followComments.length) {
        acculumator.create = relatedCommenterIds.map(id => ({ follower_id: id }))
    } else {
        acculumator = followComments.reduce((acc, { id, follower_id }) => {
            //  不在followers_in_followComment之中，卻存在此次相關commenter.followerIds行列之中，必須為該commenter建立FollowComment
            if (!followerIds.includs(follower_id)) {
                acc.create.push({ follower_id })
                //  存在followers_in_followComment之中，且存在此次相關commenter.followerIds行列之中，必須為該followComment更新數據
            } else {
                acc.update.push({ id, confirm: false })
            }
            return acc
        }, acculumator)
    }
    console.log('@ acculumator => ', acculumator)
    
    
    //  創建Comment
    let newComment = await Comment.createComment({ user_id: commenter_id, blog_id, html, p_id })
    console.log('@ newComment => ', newComment)
    
    let [comment] = await Comment.readCommentsForBlog(Opts.findCommentById(newComment.id))
    console.log('@ newComment for blog=> ', comment)
    let { id, createdAt } = comment
    let { create, update } = acculumator
    //  創建FollowComment
    if (create.length) {
        let datas = create.map(item => ({ ...item, id, createdAt }))
        await Controller_FollowComment.addFollowComments(datas)
    }
    if (update.length) {
        let datas = update.map(item => ({ ...item, target_id: id, updatedAt: createdAt }))
        let resUpdate = Controller_FollowComment.modifyFollowComments(datas)
        if (resUpdate.errno) {
            return resUpdate
        }
    }

    //  刷新 comment 的系統緩存
    let cache = { [API.COMMENT]: [blog_id] }
    //  relatedCommenter有新通知
    if(relatedCommenterIds.length){
        cache[NEWS] = relatedCommenterIds
    }
    console.log('@ cache => ', cache)
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