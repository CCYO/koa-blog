//  0423
const rawQuery = require('../db/mysql/query')
//  0423
async function readList({ user_id, excepts = { people: [], blogs: [], comments: [] }}) {
    /*
    {
        unconfirm: [
        { type, id, timestamp, confirm, fans: ... },
        { type, id, timestamp, confirm, blog: ... },
        { type, id, timestamp, confirm, comment: ... },
        ... ],
        confirm: [...] 
    }*/
    //  尋找 news（撇除 excepts）
    let newsList = await rawQuery.readNews({ user_id, excepts })
    //   { num: { unconfirm, confirm, total } }
    //  目前news總數，其中有無確認過的又各有多少
    let { num } = await rawQuery.count({ user_id, excepts })
    return { newsList, num }
}
module.exports = {
    //  0423
    readList
}