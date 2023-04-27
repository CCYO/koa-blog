const C_MsgReceiver = require('./msgReceiver')                      //  0426
const C_Comment = require('./comment')                              //  0425
const C_BlogImg = require('./blogImg')                              //  0408
const C_BlogImgAlt = require('./blogImgAlt')                        //  0408
const C_ArticleReader = require('./articleReader')                  //  0406
const { CACHE } = require('../conf/constant')                       //  0406
const my_xxs = require('../utils/xss')                              //  0406
const { MyErr, ErrRes, ErrModel, SuccModel } = require('../model')  //  0404
const Init = require('../utils/init')                               //  0404
const Opts = require('../utils/seq_findOpts')                       //  0404
const Blog = require('../server/blog')                              //  0404

//  0411
async function findInfoForPageOfSquare(author_id) {
    let list = await Blog.readList(Opts.BLOG.findInfoForPageOfSquare())
    let blogs = list.filter(({ author }) => author.id !== author_id)
    let data = Init.browser.blog.sortAndInitTimeFormat(blogs)
    return new SuccModel({ data })
}
// //  0411
// async function findInfoForPageOfAlbumList(userId, { pagination } ) {
//     let blogs = await Blog.readList(Opts.BLOG.findInfoForPageOfAlbumList(userId))
//     let author = blogs.length ? blogs[0].author : undefined
//     let albums = Init.browser.blog.pageTable(blogs, { pagination })
//     let data = { author, albums }
//     return new SuccModel({ data })
// }
//  0411
/** 刪除 blogs
 * @param {number} blog_id 
 * @returns {object} SuccModel || ErrModel
 */
async function removeList(blogList, author_id) {
    if (!Array.isArray(blogList) || !blogList.length || !author_id) {
        throw new MyErr(ErrRes.BLOG.REMOVE.NO_DATA)
    }
    //  處理cache -----
    let cache = {
        [CACHE.TYPE.NEWS]: [],
        [CACHE.TYPE.PAGE.USER]: [author_id],
        [CACHE.TYPE.PAGE.BLOG]: blogList
    }
    //  找出 readers 與 articleReaders
    let info = await blogList.reduce(async (acc, blog_id) => {
        let { data: { readers, articleReaders, replys } } = await findInfoForSubscribe(blog_id)
        let res = await acc
        res.readers = res.readers.concat(readers)
        res.articleReaders = res.articleReaders.concat(articleReaders)
        res.replys = res.replys.concat(replys)
        return res
    }, { readers: [], articleReaders: [], replys: [] })
    //  緩存: 告知使用者，重新爬 news
    if (info.readers) {
        cache[CACHE.TYPE.NEWS] = cache[CACHE.TYPE.NEWS].concat(info.readers)
    }
    //  軟刪除 articleReaders
    if (info.articleReaders.length) {
        await C_ArticleReader.removeList(info.articleReaders)
    }
    //  軟刪除 comments(內部也會軟刪除msgReceiver)
    if (info.replys.length) {
        info.replys
        let resModel = await C_Comment.removeList(info.replys)
        //  
        cache[CACHE.TYPE.API.COMMENT] = cache[CACHE.TYPE.API.COMMENT].concat(resModel.cache[CACHE.TYPE.API.COMMENT])
        cache[CACHE.TYPE.NEWS] = cache[CACHE.TYPE.NEWS].concat(resModel.cache[CACHE.TYPE.NEWS])
    }

    //  刪除 blogList
    let row = await Blog.deleteList(Opts.FOLLOW.removeList(blogList))
    if (row !== blogList.length) {
        throw new MyErr(ErrRes.BLOG.DELETE.ROW)
    }
    return new SuccModel({ cache })
}
//  0406
/** 更新 blog
 * 
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modify(blog_id, blog_data) {
    // let { title, cancelImgs = [], html, show } = blog_data
    let map = new Map(Object.entries(blog_data))
    let { NEWS, PAGE: { USER, BLOG } } = CACHE.TYPE
    let cache = {
        [NEWS]: [],
        [USER]: [],
        [BLOG]: [blog_id]
    }
    //  存放 blog 要更新的數據
    let newData = {}
    if (map.has('html')) {
        //  存放此次 blog 要更新的數據
        newData.html = my_xxs(blog_data.html)
    }
    //  更新 文章標題
    if (map.has('title')) {
        //  存放 blog 要更新的數據
        newData.title = my_xxs(blog_data.title)
        //  處理緩存
        //  若此次更新包含更改文章的公開狀態，可略過，因為下面處理show時會有同樣的操作
        if (!map.has('show')) {
            let { errno, data } = await findInfoForModifyTitle(blog_id)
            if (!errno) {
                let { author_id, followers } = data
                cache[USER] = [author_id]
                cache[NEWS] = cache[NEWS].concat(followers)
            }
        }
    }
    //  更新 文章公開狀態
    if (map.has('show')) {
        //  存放此次 blog 要更新的數據
        newData.show = blog_data.show
        let resModel
        // 處理緩存
        if (newData.show) {
            //  存放此次 blog 要更新的數據
            newData.showAt = new Date()
            resModel = await public(blog_id)
            // 隱藏blog
        } else if (!show) {
            resModel = await private(blog_id)
        }
        let { author_id, followers } = resModel.data
        cache[NEWS] = cache[NEWS].cancat(followers)
        cache[USER].push(author_id)
    }
    if (Object.getOwnPropertyNames(newData).length) {
        //  更新文章
        await Blog.update(blog_id, newData)
    }
    //  刪除圖片
    if (map.has('cancelImgs')) {
        let cancelImgs = map.get('cancelImgs')
        //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
        await removeImgs(cancelImgs)
    }
    let resModel = await findWholeInfo(blog_id)
    if (resModel.errno) {
        throw new MyErr(resModel)
    }
    let data = resModel.data
    return new SuccModel({ data, cache })
}
//  0408
async function removeImgs(imgs) {
    for (let { blogImg_id, blogImgAlt_list } of imgs) {
        //  確認 blog 內同樣 blogImg 的 blogImgAlt 有幾張
        let countModel = await C_BlogImgAlt.count(blogImg_id)
        let { errno, data: count } = countModel
        if (errno) {
            throw new MyErr({ ...countModel })
        }
        //  若查詢結果 === blogImgAlt_list.length，直接刪掉 blogImg
        if (count === blogImgAlt_list.length) {
            await C_BlogImg.removeList([blogImg_id])
            //  僅刪除 blogImgAlt.list 內的資料
        } else {
            await C_BlogImgAlt.removeList(blogImgAlt_list)
        }
    }
    return new SuccModel()
}
//  0406
async function public(blog_id) {
    let resModel = await find(Opts.BLOG.findInfoForShow(blog_id))
    if (resModel.errno) {
        throw new MyErr(resModel)
    }
    let { author: { id: author_id, fansList }, readers, replys } = resModel.data
    let fansList = new Set(fansList.map(({ id }) => id))
    let readers = [...fansList]
    let articleReaders = []
    for (let { id: reader_id, ArticleReader } of readers) {
        if (fansList.has(reader_id)) {
            fansList.delete(reader_id)
            articleReaders.push({ ...ArticleReader, deletedAt: null })
        }
    }
    for (let reader_id of [...fansList]) {
        articleReaders.push({ reader_id, article_id: blog_id })
    }
    //  恢復軟刪除 + 新增
    if (articleReaders.length) {
        await C_ArticleReader.addList(articleReaders)
    }
    let receivers = []
    let msgReceivers = []
    for (let reply of replys) {
        for (let { receiver_id, MsgReceiver } of reply.receivers) {
            receivers.push(receiver_id)
            msgReceivers.push({ ...MsgReceiver, deletedAt: null })
        }
    }
    //  恢復軟刪除
    if (msgReceivers.length) {
        await C_MsgReceiver.addList(msgReceivers)
    }
    let data = { author_id, followers: [...readers, ...receivers] }
    return new SuccModel({ data })
}
//  0406
async function private(blog_id) {
    let resModel = await find(Opts.BLOG.findInfoForHidden(blog_id))
    if (resModel.errno) {
        throw new MyErr(resModel)
    }
    let { author: { id: author_id }, readers, replys } = resModel.data
    let readers = []
    let articleReaders = []
    for (let { id: reader_id, ArticleReader } of readers) {
        readers.push(reader_id)
        articleReaders.push(ArticleReader)
    }
    //  軟刪除 articleReaders
    if (articleReaders.length) {
        await C_ArticleReader.removeList(articleReaders)
    }
    let receivers = []
    let msgReceivers = []
    for (let reply of replys) {
        for (let { id: receiver_id, MsgReceiver } of reply.receivers) {
            receivers.push(receiver_id)
            msgReceivers.push(MsgReceiver)
        }
    }
    //  軟刪除 msgReceivers
    if (msgReceivers.length) {
        await C_MsgReceiver.removeList(msgReceivers)
    }
    let data = { author_id＿, followers: [...readers, ...receivers] }
    return new SuccModel({ data })
}
//  0426
async function findInfoForModifyTitle(blog_id) {
    let resModel = await find(Opts.BLOG.findInfoForModifyTitle(blog_id))
    if (resModel.errno) {
        return new ErrModel(ErrRes.BLOG.READ.NOT_EXIST)
    }
    let { author, readers, replys } = resModel.data
    let author_id = author.id
    let fansList = new Set(author.fansList.map(({ id }) => id))
    let readers = [...fansList]
    let articleReaders = []
    //  過濾出新粉絲
    for (let { id: reader_id } of readers) {
        fansList.has(reader_id) && fansList.delete(reader_id)
    }
    //  整理新粉絲要建立的 articleReaders 的數據
    for (let reader_id of [...fansList]) {
        articleReaders.push({ reader_id, article_id: blog_id })
    }
    //  建立新粉絲的 articleReaders 的數據
    await C_ArticleReader.addList(articleReaders)
    let receivers = []
    //  整理出 receivers
    for (let reply of replys) {
        for (let { id: receiver_id } of reply.receivers) {
            receivers.push(receiver_id)
        }
    }
    let data = { author_id, followers: [...readers, ...receivers] }
    return new SuccModel({ data })
}
//  0406
/** 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function add(title, author_id) {
    const data = await Blog.create({
        title: my_xxs(title),
        author_id
    })
    const cache = { [CACHE.TYPE.PAGE.USER]: [author_id] }
    return new SuccModel({ data, cache })
}
//  0404
/** 取得 blog 紀錄
 * 
 * @param {number} blog_id blog id
 * @returns 
 */
async function findWholeInfo(blog_id) {
    if (!blog_id) {
        throw new MyErr(ErrRes.BLOG.READ.NO_DATA)
    }
    let data = await Blog.read(Opts.BLOG.findWholeInfo(blog_id))
    if (!data) {
        return new ErrModel(ErrRes.BLOG.READ.NOT_EXIST)
    }
    return new SuccModel({ data })
}
//  0404
async function find(blog_id) {
    if (!blog_id) {
        throw new MyErr(ErrRes.BLOG.READ.NO_DATA)
    }
    let data = await Blog.read(Opts.BLOG.find(blog_id))
    if (!data) {
        return new ErrModel(ErrRes.BLOG.READ.NOT_EXIST)
    }
    return new SuccModel({ data })
}
//  0404
/** 取得 blogList
 * @param {number} user_id user id
 * @param {boolean} is_author 是否作者本人
 * @returns {object} SuccessModel
 * { 
 *  blogList { 
 *      show: [ 
 *          blog {
 *              id, title, showAt, 
 *              author: { id, email, nickname, age, avatar, avatar_hash }
 *          }, ...
 *      ],
 *      hidden: [ blog, ... ]
 *  } 
 * }
 */
async function findListForUserPage(userId, options) {
    let blogs = await Blog.readList(Opts.BLOG.findListForUserPage(userId))
    let data = Init.browser.blog.pageTable(blogs, options)
    return new SuccModel({ data })
}

module.exports = {
    //  0411
    // findInfoForPageOfAlbumList,
    //  0411
    removeList,
    //  0406
    modify,
    //  0406
    add,
    //  0404
    findWholeInfo,
    //  0404
    find,
    //  0404
    findListForUserPage,
    //  0411
    findInfoForPageOfSquare
}








