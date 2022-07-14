/**
 * @description 數據格式化
 */

const moment = require('moment')

const {
    readUser
} = require('../../server/user')

const {
    readBlogById
} = require('../../server/blog')

console.log('@ readBlogById ===>', readBlogById)

async function init_4_newsList(data) {
    let { newsList, total, markTime, page } = data
    let res = { confirm: [], unconfirm: [], count: newsList.length, total, markTime, page }

    if (!res.count) {
        return res
    }

    let promiseList = await Promise.all(
        newsList.map(
            async (news) => {
                let { type, id, target_id, follow_id, confirm, time } = news
                time = moment(time, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
                if (type === 1) {
                    let { id: fans_id, nickname } = await readUser({ id: follow_id })
                    return { type, id, fans_id, nickname, confirm, time }
                } else if (type === 2) {
                    let { id: blog_id, title, author: { id: author_id, nickname } } = await readBlogById(target_id)
                    return ({ type, id, blog_id, title, author_id, nickname, confirm, time })
                }
            }
        )
    )

    let newsConfirmList = promiseList.reduce((init, item, index) => {
        let { confirm } = item
        confirm && init.confirm.push(item)
        !confirm && init.unconfirm.push(item)
        return init
    }, { unconfirm: [], confirm: [] })

    return { ...res, ...newsConfirmList }
}

module.exports = {
    init_4_newsList
}