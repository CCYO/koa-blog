/**
 * @description Server IdolFans
 */
const Init = require('../utils/init')
const { IdolFans } = require('../db/mysql/model')   //  0406
const {
    //  0406 
    MyErr,
    ErrRes
} = require('../model')

//  0423
async function updateList(datas){
    try {
        let updateOnDuplicate = Object.keys(datas[0])
        let list = await IdolFans.bulkCreate(datas, { updateOnDuplicate })
        return Init.idolFans(list)
    }catch(err){
        throw new MyErr({ ...ErrRes.IDOL_FANS.UPDATE.ERR, err})
    }
}
//  0406
async function deleteList(opts) {
    try {
        //  RV row
        return await IdolFans.destroy(opts)
    } catch (err) {
        throw new MyErr({ ...ErrRes.IDOL_FANS.DELETE.ERR, err })
    }
}

module.exports = {
    //  0423
    updateList,
    //  0406
    deleteList
}