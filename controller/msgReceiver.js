//  0411
const { MyErr, SuccModel, ErrRes, ErrModel } = require('../model')
//  0411
const Opts = require('../utils/seq_findOpts')
//  0411
const MsgReceiver = require('../server/msgReceiver');
//  0423
async function confirmList(datas){
    let updatedAt = new Date()
    let newDatas = datas.map( data => ({ ...data, updatedAt, confirm: true}))
    let list = await MsgReceiver.updateList(newDatas)
    if(list.length !== newDatas.length){
        throw new MyErr(ErrRes.MSG_RECEIVER.UPDATE.CONFIRM)
    }
    return new SuccModel({ data: list })
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
//  0411
async function addList(datas) {
    if(datas.length){
        throw new MyErr(ErrRes.MSG_RECEIVER.CREATE.NO_DATA)
    }
    let list = await MsgReceiver.bulkCreate(datas, Opts.MSG_RECEIVER.bulkCreate(datas))
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
    //  0423
    confirmList,
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





