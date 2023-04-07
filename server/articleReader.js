//  0406
const { ErrRes ,MyErr } = require('../model')
//  0406
const { ArticleReader } = require('../db/mysql/model')  //  0406
//  0406
async function createList(datas) {
    try {
        let list = await ArticleReader.bulkCreate(datas)
        if (datas.length !== list.length) {
            return new MyErr(ErrRes.ARTICLE_READER.CREATE.ROW)
        }
        return list.map( item => item.toJSON() )
    } catch (err) {
        return new MyErr({ ...ErrRes.ARTICLE_READER.CREATE.ERR, err})
    }
}
//  0406
async function deleteList(opts) {
    let res = await ArticleReader.destroy(opts)
    //  需確認 res 是甚麼
    console.log('@ S ArticleReader deleteList => ', res)
    return res
}
//  0406
async function restore(opts) {
    let res = await ArticleReader.restore(opts)
    return res
}

module.exports = {
    //  0406
    createList,
    //  0406
    deleteList,
    //  0406
    restore,

    count,
    hiddenBlog,
    readFollowers,
}
/**
 * @description ServeArticleReader*/
const { PUB_SUB } = require('../model/errRes')



async function count(opts) {
    let num = await FollowBlog.count(opts)
    return num
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







