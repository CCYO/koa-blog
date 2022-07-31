/**
 * @description 數據格式化
 */

const moment = require('moment')

/**
 * 
 * @typedef {{ id: number, nickname: string }} author
 * @typedef {{ type: number, id: number, blog_id: id, title: string, author: { author }, timestamp: string }} newsItmeForPeople
 * @typedef {{ id: number }} theNewsItem 
 * @param { { confirm: [{newsItmeForPeople|}], unconfirm: []}} newsList 
 * @returns {{ people: { theNewsItem }, blogs: { theNewsItem }}}
 */

function init_newsOfFollowId(newsList) {
    let res = {
        confirm: { people: [], blogs: [] },
        unconfirm: { people: [], blogs: [] }
    }

    for (confirmRoNot in newsList) {
        let list = newsList[confirmRoNot]
        let target = res[confirmRoNot]
        if(!list.length){
            continue
        } 
        list.forEach(({ type, id }) => {
            type === 1 && target.people.push(id)
            type === 2 && target.blogs.push(id)
        })
    }

    return res
}

module.exports = {
    init_newsOfFollowId
}