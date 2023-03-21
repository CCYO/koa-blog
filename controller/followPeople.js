const FollowBlog = require('../server/followBlog')
const Opts = require('../utils/seq_findOpts')           //  0228
const Blog = require('../controller/blog')                  //  0228
const FollowPeople = require('../server/followPeople')  //  0228

/** 取消追蹤    0228
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel | ErrorModel
 */
 async function cancelFollow({ fans_id, idol_id}) {
    let follow = await Blog.findFollowByFollowPeopleShip({idol_id, fans_id})

    if (follow.length) {
        //  刪除關聯
        let ok = await FollowBlog.deleteFollow(follow)
        if (!ok) {
            return new ErrModel(FOLLOWBLOG.DEL_ERR)
        }
    }

    let ok = await FollowPeople.deleteFollow({ idol_id, fans_id })
    if (!ok) {
        return new ErrModel(FOLLOW.CANCEL_ERR)
    }

    let cache = { [PAGE.USER]: [fans_id, idol_id], [NEWS]: [fans_id, idol_id] }
    
    return new SuccModel({ cache })
}
/** 追蹤    0228
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function addFollow({ fans_id, idol_id }) {
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