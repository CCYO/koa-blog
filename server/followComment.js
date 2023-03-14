const { FollowComment } = require('../db/mysql/model')

async function updateFollowComments(datas){
    let followComments = await FollowComment.bulkCreate(datas, { updateOnDuplicate: ['id']})
    return followComments.map( item => item.toJSON() )
}

async function createFollowComments(datas){
    let followComments = await FollowComment.bulkCreate(datas)
    return followComments.map( item => item.toJSON() )
}

async function readFollowComment(opts){
    let followComments = await FollowComment.findAll(opts)
    return followComments.map( item => item.toJSON() )
}

module.exports = {
    updateFollowComments,
    createFollowComments,
    readFollowComment
}