const { SuccModel, ErrModel } = require('../model')
const { FOLLOWCOMMENT } = require('../model/errRes')
const Opts = require('../utils/seq_findOpts')
const FollowComment = require('../server/followComment');

async function findItemsByTargets({ comment_ids }, opts) {
    let data = { comment_ids }
    let exclude = opts ? opts.exclude : undefined
        
    let items = await FollowComment.readFollowComment(Opts.FOLLOWCOMMENT.findItems(data, { exclude }))
    return new SuccModel({ data: items.map(item => item.toJSON()) })
}

async function addFollowComments(datas) {
    let followComments = await FollowComment.createFollowComments(datas)
    if(!followComments){
        return new ErrModel(FOLLOWCOMMENT.CREATE_ERR)
    }
    return new SuccModel({ data: followComments })
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
    findItemsByTargets,
    addFollowComments,
}