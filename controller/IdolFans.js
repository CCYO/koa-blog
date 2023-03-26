const IdolFans = require('../server/idolFans')  //  0228

const { CACHE: { TYPE: { PAGE, NEWS } }} = require('../conf/constant')
const FollowBlogController = require('./followBlog')  //  0309
const FollowBlog = require('../server/followBlog')
const { FOLLOW } = require('../model/errRes')
const { SuccModel, ErrModel } = require('../model')
/** 取消追蹤    0322
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel | ErrorModel
 */
 async function cancelFollow({ fansId, idolId}) {
    let { data: follows } = await FollowBlogController.findFollowsByIdolFans({idolId, fansId})
    let deletedAt = new Date()
    if (follows.length) {
        //  刪除關聯
        let datas = follows.map( id => ({id, deletedAt}))
        let ok = await FollowBlog.deleteFollows(datas)
        if (!ok) {
            return new ErrModel(FOLLOWBLOG.DEL_ERR)
        }
    }
    let ok = await IdolFans.deleteFollows({ target: idolId, follow: fansId, deletedAt })
    if (!ok) {
        return new ErrModel(FOLLOW.CANCEL_ERR)
    }
    let cache = { [PAGE.USER]: [fansId, idolId], [NEWS]: [fansId, idolId] }
    return new SuccModel({ cache })
}
/** 追蹤    0322
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function addFollow({ fansId, idolId }) {
    let { data: follows } = await FollowBlogController.findFollowsByIdolFans({idolId, fansId})
    if (follows.length) {
        //  創建關聯
        let datas = follows.map( id => ({id, deletedAt: null}))
        let ok = await FollowBlog.createFollows(datas)
        if (!ok) {
            return new ErrModel(FOLLOWBLOG.DEL_ERR)
        }
    }
    const ok = await IdolFans.createFollow({ target: idolId, follow: fansId })
    if (!ok) return new ErrModel(FOLLOW.FOLLOW_ERR)
    //  處理緩存
    let cache = { [PAGE.USER]: [fansId, idolId], [NEWS]: [idolId] }
    return new SuccModel({ cache })
}

module.exports = {
    cancelFollow,           //  0303
    addFollow,                 //  0303
}