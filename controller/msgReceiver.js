//  0411
const { MyErr, SuccModel, ErrRes, ErrModel } = require('../model')
//  0411
const Opts = require('../utils/seq_findOpts')
//  0411
const MsgReceiver = require('../server/msgReceiver');
//  0514
async function findListForModifiedUserData(msgs){
    let list = await MsgReceiver.readList(Opts.MSG_RECEIVER.findListForModifiedUserData(msgs))
    let data = list.map( ({ receiver_id }) => receiver_id)
    return new SuccModel({ data })
}
//  0423
async function confirm(id){
    let row = await MsgReceiver.update(id, { confirm: true })
    if(row !== 1){
        throw new MyErr(ErrRes.MSG_RECEIVER.UPDATE.CONFIRM)
    }
    return new SuccModel()
}
//  0426
async function removeList(datas) {
    let list = datas.map(( {id} ) => id)
    let raw = await MsgReceiver.deleteList(Opts.FOLLOW.removeList(list))
    if(list.length !== raw){
        throw new MyErr(ErrRes.MSG_RECEIVER.DELETE.ROW)
    }
    return new SuccModel()
}
//  0414
async function modifyList(datas){
    let list = await MsgReceiver.updateList(datas)
    return new SuccModel({data: list})
}
//  0414
async function forceRemoveList(list){
    let row = await MsgReceiver.deleteList(Opts.FOLLOW.forceRemove(list))
    if(list.length !== row){
        throw new MyErr(ErrRes.MSG_RECEIVER.DELETE.ROW)
    }
    return new SuccModel()
}
//  0414
async function findList(msg_id){
    let list = await MsgReceiver.readList(Opts.MSG_RECEIVER.findList(msg_id))
    if(!list){
        return new ErrModel(ErrRes.MSG_RECEIVER.READ.NOT_EXIST)
    }
    return new SuccModel({ data: list })
}
//  0406
async function addList(datas) {
    if(!datas.length){
        throw new MyErr(ErrRes.MSG_RECEIVER.CREATE.NO_DATA)
    }
    let updateOnDuplicate = ['id', 'msg_id', 'receiver_id', 'confirm', 'createdAt', 'updatedAt', 'deletedAt']
    let list = await MsgReceiver.updateList(datas, updateOnDuplicate)
    if(list.length !== datas.length){
        throw new MyErr(ErrRes.MSG_RECEIVER.CREATE.ROW)
    }
    return new SuccModel({ data: list })
}
//  0411
async function find(whereOps) {
    let data = await MsgReceiver.read(Opts.MSG_RECEIVER.find(whereOps))
    if(!data){
        return new ErrModel(ErrRes.MSG_RECEIVER.READ.NOT_EXIST)
    }
    return new SuccModel(data)
}
module.exports = {
    //  0514
    findListForModifiedUserData,
    //  0426
    removeList,
    //  0414
    modifyList,
    //  0414
    forceRemoveList,
    //  0414
    findList,
    //  0411
    addList,
    //  0411
    find
}





