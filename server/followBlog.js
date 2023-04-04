/**
 * @description ServeArticleReader*/
const { PUB_SUB } = require('../model/errRes')
const { ArticleReader } = require('../db/mysql/model')
const { MyErr } = require('../model')

async function count(opts) {
    let num = await FollowBlog.count(opts)
    return num
}
/** 刪除關聯    0322
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function deleteFollows(blog_id) {
    // let datas = []
    // if(Array.isArray(data)){
    //     datas = [...data]
    // }else{
    //     datas = [data]
    // }
    // let keys = [ ...Object.keys(datas[0]), 'updatedAt']
    // let follows = await ArticleReader.bulkCreate( datas, {
    //     updateOnDuplicate: [...keys]
    // })
    try {
        let row = await ArticleReader.destroy({ where: { blog_id } })
        console.log('@row => ', row)
        return row
    } catch (err) {
        throw new MyErr({ ...PUB_SUB.REMOVE_ERR, err})
    }
}
//  0322
async function createFollows(data) {
    let datas = []
    if (Array.isArray(data)) {
        datas = [...data]
    } else {
        datas = [data]
    }
    datas = datas.map(item => ({ ...item, deletedAt: null }))
    let keys = [...Object.keys(datas[0]), 'updatedAt']
    let follows = await ArticleReader.bulkCreate(datas, {
        updateOnDuplicate: [...keys],
    })
    if (datas.length !== follows.length) {
        return false
    }
    return true
}

async function readFollowers(opts) {
    let followers = await ArticleReader.findAll(opts)
    return followers.map(follower => follower.toJSON())
}

async function hiddenBlog({ where }) {
    // let { blog_id, confirm } = opts
    let opts = { where }
    let row = await ArticleReader.destroy(opts)
    if (!row) {
        return false
    }
    return true
}

async function restoreBlog(opt_where) {
    let where = { ...opt_where }

    await ArticleReader.restore(where)
}





module.exports = {
    count,
    deleteFollows,     //  0228

    createFollows,
    restoreBlog,

    hiddenBlog,
    readFollowers,


}