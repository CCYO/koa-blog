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

/**
 * 
 * @param { { confirm: [], unconfirm: []}} newsList 
 * @returns 
 */
function init_listOfNewsId(newsList){
    let res = { people: [], blogs: []}
    if(!newsList.length){
        return res
    }
    
    return newsList.reduce( (initVal, {type, id}) => {
        type === 1 && initVal.people.push(id)
        type === 2 && initVal.blogs.push(id)
        return initVal
    }, res)
}

async function init_newsList(newsList) {
    if (!newsList.length) {
        return []
    }

    let listOfPromise = newsList.map(_init)

    listOfPromise = await Promise.all(listOfPromise)

    let res = listOfPromise.reduce((initVal, currVal, index) => {
        let { confirm } = currVal
        confirm && initVal.confirm.push(currVal)
        !confirm && initVal.unconfirm.push(currVal)
        return initVal
    }, { unconfirm: [], confirm: [] })

    return res
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
    init_newsList,
    init_listOfNewsId
}