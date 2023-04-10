//  0411
const { ErrRes, MyErr } = require('../model')
//  0411
const { MsgReceiver } = require('../db/mysql/model')
//  0411
async function bulkCreate(datas, opts) {
    try {
        let list = await MsgReceiver.bulkCreate(datas, opts)
        if(list.length !== datas.length){
            throw new MyErr(ErrRes.MSG_RECEIVER.CREATE.ROW)
        }
        return Init.msgReceiver(list)
    }catch(err){
        throw new MyErr({...ErrRes.MSG_RECEIVER.CREATE.ERR, err})
    }
}
//  0411
async function read(opts) {
    let list = await MsgReceiver.findOne(opts)
    return list.map(item => item.toJSON() )
}
module.exports = {
    //  0411
    bulkCreate,
    //  0411
    read,
    updateFollowComments,
}


const Init = require('../utils/init')


async function updateFollowComments(datas) {
    let keys = Object.keys(datas)
    let followComments = await MsgReceiver.bulkCreate(datas, { updateOnDuplicate: [...keys, 'updatedAt'] })
    let json = followComments.map(item => item.toJSON())
    if(json.length !== datas.length){
        return false
    }else{
        return json
    }

}



