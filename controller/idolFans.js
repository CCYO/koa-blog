const { SuccModel, ErrRes, MyErr } = require('../model')                    //  0406
const { CACHE: { TYPE: { PAGE, NEWS } } } = require('../conf/constant')     //  0406
const C_ArticleReader = require('./articleReader')              //  0406
const IdolFans = require('../server/idolFans')                              //  0406
const C_User = require('./user')                                //  0406
const Opts = require('../utils/seq_findOpts')                               //  0406
//  0423
async function confirmList(datas){
    let updatedAt = new Date()
    let newDatas = datas.map( data => ({ ...data, updatedAt, confirm: true}))
    let list = await IdolFans.updateList(newDatas)
    if(list.length !== newDatas.length){
        throw new MyErr(ErrRes.IDOL_FANS.UPDATE.CONFIRM)
    }
    return new SuccModel({ data: list })
}
//  0406
/** 取消追蹤
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel | ErrorModel
 */
async function cancelFollow({ fans_id, idol_id }) {
    //  尋找 IdolFans + ArticleReader 關係
    let { data: { idolFans_id_list, articleReader_id_list } } = await C_User.findInfoForFollowIdol({ fans_id, idol_id })
    //  若無值，報錯
    if (!idolFans_id_list.length) {
        throw new MyErr(ErrRes.IDOL_FANS.DELETE.NO_IDOL)
        //  軟刪除
    } else {
        await _removeList(idolFans_id_list)
        if (articleReader_id_list.length) {
            await C_ArticleReader.removeList(articleReader_id_list)
        }
    }
    let cache = { [PAGE.USER]: [fans_id, idol_id], [NEWS]: [idol_id] }
    return new SuccModel({ cache })
}
//  0406
async function _removeList(id_list) {
    let row = await IdolFans.deleteList(Opts.FOLLOW.removeList(id_list))
    if(id_list.length !== row){
        throw new MyErr(ErrRes.IDOL_FANS.DELETE.ROW)
    }
    return new SuccModel()
}
//  0406
/** 追蹤
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function follow({ fans_id, idol_id }) {
    //  若此次 add 不是第一次，代表可能會有軟刪除的 ArticleReader 關係
    //  尋找軟刪除的 IdolFans + ArticleReader 關係
    let { data: { idolFans_id_list, articleReader_id_list } } = await C_User.findInfoForFollowIdol({ fans_id, idol_id })
    //  恢復軟刪除
    if (idolFans_id_list.length) {
        //  需確認
        await _restoreList(idolFans_id_list)
        if (articleReader_id_list.length) {
            //  需確認
            await C_ArticleReader.restoreList(articleReader_id_list)
        }
        //  代表這次是初次追蹤
    } else {
        await IdolFans.createList([{ idol_id, fans_id }])
    }
    let cache = { [PAGE.USER]: [fans_id, idol_id], [NEWS]: [idol_id] }
    return new SuccModel({ cache })
}
//  0406
async function _restoreList(id_list) {
    let row = await IdolFans.restore(Opts.FOLLOW.restoreList(id_list))
    if(row !== id_list.length){
        throw new MyErr(ErrRes.IDOL_FANS.RESTORE.ROW_ERR)
    }
    return new SuccModel({ data })
}

module.exports = {
    //  0423
    confirmList,
    //  0406
    cancelFollow,
    //  0406
    follow
}



