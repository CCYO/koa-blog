
const { SuccModel, ErrModel } = require('../model') //  0404
const Opts = require('../utils/seq_findOpts')       //  0404
const Comment = require('../server/comment')        //  0404

//  0404
async function findRelativeUnconfirmList({ pid, article_id, createdAt }){
    let comments = await Comment.readList(Opts.COMMENT.findRelativeUnconfirmList({ pid, article_id, createdAt }))
    let data = Init.comment(comments)
    return new SuccModel({ data })
}
//  0404
async function findInfoForNews(commentId){
    let comment = await Comment.read(Opts.COMMENT.findWholeInfo(commentId))
    if(!comment){
        return new ErrModel(NOT_EXIST)
    }
    let data = Init.browser.comment(comment)
    return new SuccModel({ data })
}

module.exports = {
    //  0404
    findRelativeUnconfirmList,
    //  0404
    findInfoForNews,
    
    findBlogsOfCommented,  //  0303
    removeComment,
    addComment,             //  0316
    findCommentsByBlogId,    //  0228

    _findCommentsRelatedToPid
}

const { COMMENT: { NOT_EXIST, REMOVE_ERR } } = require('../model/errRes')
const Controller_FollowComment = require('./followComment')
const { CACHE: { TYPE: { NEWS, API } } } = require('../conf/constant')



const Init = require('../utils/init')
const { Comment } = require('../db/mysql/model')


//  0303
async function findBlogsOfCommented(commenterId){
    let comments = await Comment.readComments(Opts.COMMENT.findBlogsOfCommented(commenterId))
    let data = comments.map(({blog_id}) => blog_id )
    data = [...new Set(data)]
    return new SuccModel({data})
}
//  0328
async function removeComment({ author_id, commenter_id, commentId, blog_id, p_id }) {
    //  整理出要通知的 commenters
    let { data: { commenterIds } } = await _findCommentsRelatedToPid({blog_id, p_id, commenter_id, author_id})
    
    let cache = {
        [API.COMMENT]: [blog_id],
        [NEWS]: commenterIds
    }
    let ok = await Comment.deleteComment({ commentId, blog_id })
    if (!ok) {
        return new ErrModel(REMOVE_ERR)
    }
    return new SuccModel({cache})
}
//  0316
async function addComment({ commenter_id, blog_id, html, p_id, author_id }) {
    //  找出相關comment
    let resModel = await _findCommentsRelatedToPid({blog_id, p_id, commenter_id, author_id})

    let {
        commenterIds: relatedCommenterIds,  //  
        commentIds: relatedCommentIds
    } = resModel.data
    //  撈出FollowComment內，target_id符合relactiveCommentIds的所有條目(且不包含curCommenter)
    let { data: followComments } = await Controller_FollowComment.findItemsByTargets(
        { comment_ids: relatedCommentIds },
        { exclude: { follower_id: [commenter_id] } }
    )

    //  relatedCommenterId 不符合 followComments.follower_id，則需創建 followComment 追蹤通知
    //  relatedCommenterId 符合 followComments.follower_id，則需更新 followComment 追蹤通知
    let acculumator = { create: [], update: [] }
    //  沒有相關的評論
    if (!followComments.length) {
        //  紀錄
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
    //  創建Comment
    let { id: comment_id, createdAt } = await Comment.createComment({ user_id: commenter_id, blog_id, html, p_id })
    let { create, update } = acculumator
    //  創建FollowComment
    if (create.length) {
        let datas = create.map(item => ({ ...item, comment_id, createdAt }))
        let resModel = await Controller_FollowComment.addFollowComments(datas)
        if(resModel.errno){
            return resModel
        }
    }
    if (update.length) {
        let datas = update.map(item => ({ ...item, comment_id, createdAt }))
        let resUpdate = Controller_FollowComment.modifyFollowComments(datas)
        if (resUpdate.errno) {
            return resUpdate
        }
    }

    //  刷新 comment 的系統緩存
    let cache = { [API.COMMENT]: [blog_id] }
    //  relatedCommenter有新通知
    if (relatedCommenterIds.length) {
        cache[NEWS] = relatedCommenterIds
    }
    //  讀取符合Blog格式數據格式的新Comment
    let resModel_NewComment = await _findCommentForBlog(comment_id)
    if(resModel_NewComment.errno){
        return resModel_NewComment
    }
    let data = resModel_NewComment.data
    return new SuccModel({ data, cache })
}
async function _findCommentForBlog(comment_id){
    let comment = await Comment.readComment(Opts.COMMENT.findCommentById(comment_id))
    if(!comment){
        return ErrModel(NOT_EXIST)
    }
    let data = Init.browser.comment(comment)
    return new SuccModel({data})
}
//  0316
async function _findCommentsRelatedToPid({blog_id, p_id, commenter_id, author_id}){
    let relatedComments = await Comment.readComments(Opts.COMMENT.findBlogCommentsRelatedPid({ blog_id, p_id }))
    // if(!author_id && !commenter_id){
    //     return new SuccModel({ data: relatedComments })
    // }
    //  若有 author_id，則代表希望整理相關數據
    //  撈出相關comments的commenters(不含curCommenter)
    let relatedCommenterIds = relatedComments.map(({ commenter }) => {
        if (commenter.id === commenter_id) {
            return null
        }
        return commenter.id
    }).filter(commenterId => commenterId)
    //  author也是相關commenter
    if (author_id !== commenter_id) {
        relatedCommenterIds.push(author_id)
    }
    //  刪去重複的commenterId
    relatedCommenterIds = [...new Set(relatedCommenterIds)]
    //  撈出目前相關commentId
    let relatedCommentIds = relatedComments.map(({ id }) => id)
    let data = {
        comments: relatedComments,
        commenterIds: relatedCommenterIds,
        commentIds: relatedCommentIds
    }
    return new SuccModel({ data })
}
//  0228
async function findCommentsByBlogId(blog_id) {
    let comments = await Comment.readComments(Opts.COMMENT.findCommentsByBlogId(blog_id))
    let data = Init.browser.comment(comments)
    return new SuccModel({ data })
}

