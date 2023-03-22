const { CACHE: { TYPE: { PAGE, NEWS } }} = require('../conf/constant')

const FollowBlogController = require('./followBlog')  //  0309
const FollowBlog = require('../server/followBlog')
const FollowPeople = require('../server/followPeople')  //  0228
const { FOLLOW } = require('../model/errRes')
const { SuccModel, ErrModel } = require('../model')
/** 取消追蹤    0322
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel | ErrorModel
 */
 async function cancelFollow({ fans_id, idol_id}) {
    let { data: follows } = await FollowBlogController.findFollowsByIdolFans({idol_id, fans_id})
    let deletedAt = new Date()
    if (follows.length) {
        //  刪除關聯
        let datas = follows.map( id => ({id, deletedAt}))
        let ok = await FollowBlog.deleteFollows(datas)
        if (!ok) {
            return new ErrModel(FOLLOWBLOG.DEL_ERR)
        }
    }
    let ok = await FollowPeople.deleteFollows({ idol_id, fans_id, deletedAt })
    if (!ok) {
        return new ErrModel(FOLLOW.CANCEL_ERR)
    }
    let cache = { [PAGE.USER]: [fans_id, idol_id], [NEWS]: [fans_id, idol_id] }
    return new SuccModel({ cache })
}
/** 追蹤    0322
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function addFollow({ fans_id, idol_id }) {
    let { data: follows } = await FollowBlogController.findFollowsByIdolFans({idol_id, fans_id})
    if (follows.length) {
        //  刪除關聯
        let datas = follows.map( id => ({id, deletedAt: null}))
        let ok = await FollowBlog.createFollows(datas)
        if (!ok) {
            return new ErrModel(FOLLOWBLOG.DEL_ERR)
        }
    }
    const ok = await FollowPeople.createFollow({ idol_id, fans_id })
    if (!ok) return new ErrModel(FOLLOW.FOLLOW_ERR)
    //  處理緩存
    let cache = { [PAGE.USER]: [fans_id, idol_id], [NEWS]: [idol_id] }
    return new SuccModel({ cache })
}

module.exports = {
    cancelFollow,           //  0303
    addFollow,                 //  0303
}