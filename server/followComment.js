const Init = require('../utils/init')
const { FOLLOWCOMMENT: { CREATE_ERR } } = require('../model/errRes')
const { FollowComment } = require('../db/mysql/model')
const { MyErr, ErrModel } = require('../model')

async function updateFollowComments(datas) {
    let keys = Object.keys(datas)
    let followComments = await FollowComment.bulkCreate(datas, { updateOnDuplicate: [...keys, 'updatedAt'] })
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
        if(followComments.length !== datas.length){
            return false
        }
        return Init.followComment(followComments)
    }catch(err){
        throw new MyErr({...CREATE_ERR, err})
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