const { cache } = require('ejs')
const { FollowComment } = require('../db/mysql/model')

async function updateFollowComments(datas) {
    let followComments = await FollowComment.bulkCreate(datas, { updateOnDuplicate: ['id'] })
    let json = followComments.map(item => item.toJSON())
    if(json.length !== datas.length){
        return false
    }else{
        return json
    }

}

async function createFollowComments(datas) {
    try {
        let followComments = await FollowComment.bulkCreate(datas)
        return followComments.map(item => item.toJSON())
    }catch(err){
        throw new Error(err)
    }
}

async function readFollowComment(opts) {
    let followComments = await FollowComment.findAll(opts)
    return followComments.map(item => item.toJSON())
}

module.exports = {
    updateFollowComments,
    createFollowComments,
    readFollowComment
}