const { SuccModel, ErrModel } = require('../model')
const { FOLLOWCOMMENT } = require('../model/errRes')
const Opts = require('../utils/seq_findOpts')
const FollowComment = require('../server/followComment');

async function findItemsByTargetsAndExcludeTheFollowers({ comment_ids, follower_ids }) {
    let items = await FollowComment.readFollowComment(Opts.FollowComment.findItemsByTargetsAndExcludeTheFollowers({ comment_ids, follower_ids }))
    return new SuccModel({ data: items.map(item => item.toJSON()) })
}

async function addFollowComments(datas) {
    let items = await FollowComment.createFollowComments(datas)
    return new SuccModel({ data: items.map(item => item.toJSON()) })
}

async function modifyFollowComments(datas){
    let jsons = await FollowComment.updateFollowComments(datas)
    if(!jsons){
        return new ErrModel(FOLLOWCOMMENT.UPDATE_ERR)
    }
    return new SuccModel({data: jsons})
}

module.exports = {
    modifyFollowComments,
    addFollowComments,
    findItemsByTargetsAndExcludeTheFollowers
}