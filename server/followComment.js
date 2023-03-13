const { FollowComment } = require('../db/mysql/model')

async function createFollowComments(datas){
    let followComments = await FollowComment.bulkCreate(datas)
}

async function readFollowComment(opts){
    let followComments = await FollowComment.findAll(opts)
    return followComments.map( item => item.toJSON() )
}

module.exports = {
    createFollowComments,
    readFollowComment
}