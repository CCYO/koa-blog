const {
    //  0406
    ErrRes,
    //  0406
    MyErr,
    //  0406
    SuccModel
} = require('../model')
const Opts = require('../utils/seq_findOpts')               //  0406
const ArticleReader = require('../server/articleReader')    //  0406

//  0406
async function addList(datas) {
    let list = await ArticleReader.createList(datas)
    return new SuccModel({ data: list })
}
//  0406
async function removeList(id_list) {
    let raw = await ArticleReader.deleteList(Opts.FOLLOW.removeList(id_list))
    if(id_list.length !== raw){
        throw new MyErr(ErrRes.ARTICLE_READER.DELETE.ROW_ERR)
    }
    return new SuccModel()
}
//  0406
async function restoreList(id_list){
    let row = await ArticleReader.restore(Opts.FOLLOW.restoreList(id_list))
    if(row !== id_list.length){
        throw new MyErr(ErrRes.ARTICLE_READER.RESTORE.ROW)
    }
    return new SuccModel()
}
module.exports = {
    //  0406
    addList,
    //  0406
    removeList,
    //  0406
    restoreList,
    count, 
}


async function count(blog_id){
    let data = await ArticleReader.count(Opts.PUB_SCR.count(blog_id))
    return new SuccModel({ data })
}
