const { 
    ErrModel,
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
        throw new MyErr(ErrRes.ARTICLE_READER.RESTORE.ROW_ERR)
    }
    return new SuccModel()
}
module.exports = {
    //  0406
    removeList,
    //  0406
    restoreList,
    count, 
    removeSubscribers,      //  0326
    addSubscribers,         //  0326
    findFollowsByIdolFans   //  0326
}

const { FOLLOWBLOG } = require('../model/errRes')


const User = require("../server/user")


async function count(blog_id){
    let data = await ArticleReader.count(Opts.PUB_SCR.count(blog_id))
    return new SuccModel({ data })
}
async function removeSubscribers(blog_id) {
    // let deletedAt = new Date()
    // let data = { blog_id, deletedAt }
    let ok = await ArticleReader.deleteFollows(blog_id)
    // if(!ok){
    //     return new ErrModel(FOLLOWBLOG.CREATE_ERROR)
    // }
    return new SuccModel()
}
async function addSubscribers({ blog_id, fans }) {
    let data = fans.map( id => ({ blog_id, follower_id: id }))
    let ok = await ArticleReader.createFollows(data)
    if(!ok){
        return new ErrModel(FOLLOWBLOG.CREATE_ERROR)
    }
    return new SuccModel()
}

async function findFollowsByIdolFans({ idolId, fansId }) {
    let user = await User.readUser(Opts.USER.findArticleReaderByIdolFans({ idolId, fansId }))
    let data
    if (!user) {
        data = []
    } else {
        let follower = user.fans[0]
        data = follower.ArticleReader_B.map(({ ArticleReader }) => ArticleReader.id)
    }
    return new SuccModel({ data })
}

