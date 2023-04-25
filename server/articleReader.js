const Init = require('../utils/init')
//  0406
const { ErrRes, MyErr } = require('../model')
//  0406
const { ArticleReader } = require('../db/mysql/model')  //  0406
//  0423
async function updateList(datas){
    try {
        let updateOnDuplicate = Object.keys(datas[0])
        let list = await ArticleReader.bulkCreate(datas, { updateOnDuplicate })
        return Init.articleReader(list)
    }catch(err){
        throw new MyErr({ ...ErrRes.ARTICLE_READER.UPDATE.ERR, err})
    }
}
//  0406
async function createList(datas) {
    try {
        let updateOnDuplicate = ['id', 'article_id', 'reader_id', 'createdAt', 'updatedAt', 'confirm']
        let list = await ArticleReader.bulkCreate(datas, { updateOnDuplicate })
        if (datas.length !== list.length) {
            return new MyErr(ErrRes.ARTICLE_READER.CREATE.ROW)
        }
        return list.map(item => item.toJSON())
    } catch (err) {
        return new MyErr({ ...ErrRes.ARTICLE_READER.CREATE.ERR, err })
    }
}
//  0406
async function deleteList(opts) {
    try {
        //  RV row
        return await ArticleReader.destroy(opts)
    } catch (err) {
        throw new MyErr({ ...ErrRes.ARTICLE_READER.DELETE.ERR, err })
    }
}
//  0406
// async function restore(opts) {
//     let res = await ArticleReader.restore(opts)
//     return res
// }

module.exports = {
    //  0423
    updateList,
    //  0406
    createList,
    //  0406
    deleteList,
    //  0406
    // restore,

    count,
    hiddenBlog,
    readFollowers,
}



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







