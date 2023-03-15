const { COMMENT: { REMOVE_ERR } } = require('../model/errRes')
const Controller_FollowComment = require('./followComment')
const { CACHE: { TYPE: { PAGE, NEWS, API } } } = require('../conf/constant')
const Opts = require('../utils/seq_findOpts')
const Comment = require('../server/comment')

const { SuccModel, ErrModel } = require('../model')
const FollowComment = require('../server/followComment')

async function removeComment({ author_id, commenter_id, commentId, blog_id, p_id }) {
    //  整理出要通知的使用者
    //  找出相關comment
    let relatedComments = await Comment.readComment(Opts.Comment.findRelatedComments({ blog_id, p_id }))
    console.log('@relatedComments => ', relatedComments)
    //  撈出相關comments的commenters(不含curCommenter)
    let relatedCommenterIds = relatedComments.map(({ commenter }) => {
        if (commenter.id === commenter_id) {
            return null
        }
        return commenter.id
    }).filter(commenterId => commenterId)
    console.log('@relatedCommenterIds => ', relatedCommenterIds)
    //  author也是相關commenter
    if (author_id !== commenter_id) {
        relatedCommenterIds.push(author_id)
    }
console.log('@relatedCommenterIds => ', relatedCommenterIds)
    let cache = {
        [API.COMMENT]: [blog_id]
    }
    if (relatedCommenterIds.length) {
        cache[NEWS] = relatedCommenterIds
    }
    console.log('@cache => ', cache)
    return 

    let ok = await Comment.deleteComment({ commentId, blog_id })
    if (!ok) {
        return new ErrModel(REMOVE_ERR)
    }


    
    // let cacheNews = await setRelatedComment(json, { author })

    // let cache = { news: cacheNews, blog: [ blog_id ] }
    // let [ comment ] = await readComment({ id: json.id })
    return new SuccModel(res, cache)
}

//  0228
async function findCommentsByBlogId(blog_id) {
    let comments = await Comment.readCommentsForBlog(Opts.findCommentsByBlogId(blog_id))
    return new SuccModel({ data: comments })
}

async function addComment({ commenter_id, blog_id, html, p_id, author_id }) {
    //  找出相關comment
    let relatedComments = await Comment.readComment(Opts.Comment.findRelatedComments({ blog_id, p_id }))
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
    //  撈出FollowComment內，target_id符合relactiveCommentIds的所有條目(且不包含curCommenter)
    let { data: followComments } = await Controller_FollowComment.findItemsByTargets(
        { comment_ids: relatedCommentIds },
        { exclude: { follower_id: [commenter_id] } }
    )

    //  relatedCommenterId 不符合 followComments.follower_id，則需創建 followComment 追蹤通知
    //  relatedCommenterId 符合 followComments.follower_id，則需更新 followComment 追蹤通知
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
    //  創建Comment
    let newComment = await Comment.createComment({ user_id: commenter_id, blog_id, html, p_id })
    //  讀取符合Blog格式數據格式的新Comment
    let [comment] = await Comment.readCommentsForBlog(Opts.Comment.findCommentById(newComment.id))
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
    if (relatedCommenterIds.length) {
        cache[NEWS] = relatedCommenterIds
    }
    return new SuccModel({ data: comment, cache })
}



module.exports = {
    removeComment,

    addComment,
    findCommentsByBlogId //  0228
}