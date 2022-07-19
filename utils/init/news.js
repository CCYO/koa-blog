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

async function init_4_newsList(newsList) {
    if (!newsList.length) {
        return []
    }

    let promiseList = newsList.map(_init)

    let init_newsList = await Promise.all(promiseList)

    init_newsList = init_newsList.reduce((initVal, currVal, index) => {
        let { confirm } = currVal
        confirm && initVal.confirm.push(currVal)
        !confirm && initVal.unconfirm.push(currVal)
        return initVal
    }, { unconfirm: [], confirm: [] })

    return init_newsList
}

async function _init(item) {
    let { type, id, target_id, follow_id, confirm, time } = item
    let timestamp = moment(time, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
    if (type === 1) {
        let { id: fans_id, nickname } = await readUser({ id: follow_id })
        return { type, id, fans_id, nickname, confirm, timestamp }
    } else if (type === 2) {
        let { id: blog_id, title, author: { id: author_id, nickname } } = await readBlogById(target_id)
        return ({ type, id, blog_id, title, author_id, nickname, confirm, timestamp })
    }
}

module.exports = {
    init_4_newsList
}