//  0411
const { MyErr, SuccModel, ErrRes, ErrModel } = require('../model')
//  0411
const Opts = require('../utils/seq_findOpts')
//  0411
const MsgReceiver = require('../server/msgReceiver');
//  0414
async function findList(msg_id){
    let list = await MsgReceiver.readList(Opts.MSG_RECEIVER.findList(msg_id))
    if(!list){
        return new ErrModel(ErrRes.MSG_RECEIVER.READ.NOT_EXIST)
    }
    return SuccModel({ data: list })
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
    //  0414
    findList,
    //  0411
    addList,
    //  0411
    find,
    modifyFollowComments,
}



async function modifyFollowComments(datas){
    let jsons = await MsgReceiver.updateFollowComments(datas)
    if(!jsons){
        return new ErrModel(FOLLOWCOMMENT.UPDATE_ERR)
    }
    return new SuccModel({data: jsons})
}

