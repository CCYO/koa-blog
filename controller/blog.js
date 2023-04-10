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
async function findInfoForPageOfSquare() {
    let blogs = await Blog.readList(Opts.BLOG.findInfoForPageOfSquare())
    let data = Init.browser.blog.sortAndInitTimeFormat(blogs)
    return new SuccModel({ data })
}
//  0411
async function findInfoForPageOfAlbumList(userId, { pagination } ) {
    let blogs = await Blog.readList(Opts.BLOG.findInfoForPageOfAlbumList(userId))
    let author = blogs.length ? blogs[0].author : undefined
    let albums = Init.browser.blog.pageTable(blogs, { pagination })
    let data = { author, albums }
    return new SuccModel({ data })
}
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
    //  找出 readers
    let readers = await blogList.reduce(async (readerList, blog_id) => {
        let { data: { readers } } = await findInfoForSubscribe(blog_id)
        let list = await readerList
        list.concat(readers)
        return list
    }, [])
    let cache = {
        [CACHE.TYPE.NEWS]: readers,
        [CACHE.TYPE.PAGE.USER]: [author_id]
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
async function modify(author_id, blog_id, blog_data) {
    // let { title, cancelImgs = [], html, show } = blog_data
    let map = new Map(Object.entries(blog_data))
    let cache = { [CACHE.TYPE.PAGE.BLOG]: blog_id }
    //  存放 blog 要更新的數據
    let newData = {}
    if (map.has('title')) {
        let { data } = await findInfoForSubscribe(blog_id)
        let { show, fansList } = data
        //  若 當前是公開狀態，必須告知 fansList
        if (show) {
            cache[CACHE.TYPE.NEWS] = fansList
        }
        //  無論 show 是公開/隱藏，都會影響到作者資訊頁
        cache[CACHE.TYPE.PAGE.USER] = [author_id]
        //  存放 blog 要更新的數據
        newData.title = my_xxs(blog_data.title)
    }
    if (map.has('html')) {
        //  存放 blog 要更新的數據
        newData.html = my_xxs(blog_data.html)
    }
    //  依show處理更新 BlogFollow
    if (map.has('show')) {
        let show = blog_data.show
        //  存放 blog 要更新的數據
        newData.show = show
        let resModel
        // 公開blog
        if (show) {
            //  存放 blog 要更新的數據
            newData.showAt = new Date()
            resModel = await public(blog_id)
            // 隱藏blog
        } else if (!show) {
            resModel = await private(blog_id)
        }
        cache[CACHE.TYPE.NEWS] = cache[CACHE.TYPE.NEWS] ? cache[CACHE.TYPE.NEWS].concat(resModel.data) : resModel.data
        cache[CACHE.TYPE.PAGE.USER] = [author_id]
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
async function private(blog_id) {
    let { data } = await findInfoForSubscribe(blog_id)
    let { articleReaders, readers } = data
    //  軟刪除
    if (articleReaders.length) {
        await C_ArticleReader.removeList(articleReaders)
    }
    return new SuccModel({ data: readers })
}
//  0406
async function public(blog_id) {
    let { data } = await findInfoForSubscribe(blog_id)
    let { articleReaders, listWithNotReader, fansList } = data
    //  復原軟刪除
    if (articleReaders.length) {
        await C_ArticleReader.restoreList(articleReaders)
    }
    //  創建 articleReader
    if (listWithNotReader.length) {
        let datas = listWithNotReader.map(reader_id => ({ reader_id, article_id: blog_id }))
        await C_ArticleReader.addList(datas)
    }
    return new SuccModel({ data: fansList })
}
//  0406
async function findInfoForSubscribe(blog_id) {
    let blog = await Blog.read(Opts.BLOG.findInfoForSubscribe(blog_id))
    if (!blog) {
        throw new MyErr(ErrRes.BLOG.READ.NOT_EXIST)
    }
    let readers = blog.readers.map(({ id }) => id)
    let fansList = blog.author.fansList.map(({ id }) => id)
    //  軟刪除狀態的 articleReader_id
    let articleReaders = blog.readers.map(({ ArticleReader }) => ArticleReader.id)
    //  是作者的粉絲，但尚未成為 reader
    let listWithNotReader = fansList.map(fans => {
        let isReader = blog.readers.includes(reader => { fans === reader.id })
        if (!isReader) {
            return fans
        }
        return undefined
    }).filter(id => id)
    let data = { articleReaders, readers, fansList, listWithNotReader, show: blog.show }
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
    findInfoForPageOfAlbumList,
    //  0411
    removeList,
    //  0406
    modify,
    //  0406
    findInfoForSubscribe,
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








