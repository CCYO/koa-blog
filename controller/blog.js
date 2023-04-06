const { CACHE } = require('../conf/constant')                       //  0406
const my_xxs = require('../utils/xss')                              //  0406
const { MyErr, ErrRes, ErrModel, SuccModel } = require('../model')             //  0404
const Init = require('../utils/init')                               //  0404
const Opts = require('../utils/seq_findOpts')                       //  0404
const Blog = require('../server/blog')                              //  0404
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
    let fans = []
    if (map.has('title') || map.has('show')) {
        //  取得作者的粉絲群
        //  取得 作者的 fansList + readers
        
        let res = await Blog.find(Opts.BLOG.findReadersAndFansList({author_id, blog_id}))
        let resModel = await _findList_FansId(author_id)
        console.log('@resModel.data => ', resModel.data)
        fans = resModel.data
        //  提供緩存處理
        cache[CACHE.TYPE.NEWS] = fans
        cache[CACHE.TYPE.PAGE.USER] = [author_id]
    }
    //  存放 blog 要更新的數據
    let newData = {}
    if (map.has('title')) {
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
        // 公開blog
        if (show) {
            newData.showAt = new Date()
            //  
            if (fans.length) {
                let resModel = await Controller_FollowBlog.addSubscribers({ blog_id, fans })
                if (resModel.errno) {
                    return resModel
                }
            }
            // 隱藏blog
        } else if (!show) {
            newData.showAt = null
            await Controller_FollowBlog.removeSubscribers(blog_id)
            let { data: stillHaveFans } = Controller_FollowBlog.count(blog_id)
            //  軟刪除既有的條目
            if (stillHaveFans) {
                return new ErrModel(PUB_SUB.REMOVE_ERR)
            }
        }
    }
    if (Object.getOwnPropertyNames(newData).length) {
        //  更新文章
        let ok = await Blog.updateBlog({ blog_id, newData })
        if (!ok) {
            return new ErrModel(UPDATE_ERR)
        }
    }
    //  刪除圖片
    if (map.has('cancelImgs')) {
        let cancelImgs = map.get('cancelImgs')
        //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
        let resModel = await removeImgs(cancelImgs)
        if (resModel.errno) {
            return resModel
        }
    }
    let resModel = await findBlog({ blog_id, author_id })
    if (resModel.errno) {
        return resModel
    }
    let data = resModel.data
    return new SuccModel({ data, cache })
}
//  0406
async function findReadersAndFansListAndFans({author_id, blog_id}){
    let res = await Blog.read(Opts.BLOG.findReadersAndFansList({author_id, blog_id}))
    if(!res){
        throw new MyErr(ErrRes.BLOG.READ.NOT_EXIST)
    }
    console.log('@res => ', res)
    let { readers, author: { fansList } } = res
    let articleReaders = readers.map( ({ ArticleReaders }) => ArticleReaders.id ) 
    fansList = fansList.map( ({ id }) => id )

    //                      SHOW                            HIDDEN
    //  fans === reader -> restore(ArticleReaders)          destoryReader(ArticleReaders)
    //  fans !== reader -> addReader(article, reader)       N/A
    
    //  
    let data = {
        readers,    //  SHOW
        fansList,   //  SHOW
        articleReaders    //  用在 hidden
    }
    return new SuccModel({data})
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
        return new ErrModel(ErrRes.BLOG.READ.NO_DATA)
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
        return new ErrModel(ErrRes.BLOG.READ.NO_DATA)
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
    //  0406
    modify,
    //  0406
    findReadersAndFansListAndFans,
    //  0406
    add,
    //  0404
    findWholeInfo,
    //  0404
    find,
    //  0404
    findListForUserPage,
    findBlogsHasPhoto,      //  0328
    findSquareBlogList,      //  0303
    removeBlogs,            //  0303
}


const User = require('../server/user')
const { BLOG: { REMOVE_ERR, NOT_EXIST, UPDATE_ERR }, PUB_SUB } = require('../model/errRes')
const Controller_FollowBlog = require('./articleReader')   //  0326
const Controller_BlogImgAlt = require('./blogImgAlt')


// const { organizedList, sortAndInitTimeFormat } = require('../utils/init/blog')   //  0326
const FollowBlog = require('../server/articleReader')  //  0326
const { IdolFans } = require('../db/mysql/model')



//  0326
async function findSquareBlogList(exclude_id) {
    let blogs = await Blog.readBlogs(Opts.findPublicBlogListByExcludeId(exclude_id))
    blogs = Init.browser.blog.sortAndInitTimeFormat(blogs)
    return new SuccModel({ data: blogs })
}


/** 刪除 blogs  0326
 * @param {number} blog_id 
 * @returns {object} SuccModel || ErrModel
 */
async function removeBlogs(blogIdList, authorId) {
    if (!Array.isArray(blogIdList)) {
        blogIdList = [blogIdList]
    }

    //  處理cache -----
    //  找出 blog 的 follower
    let subscripters = await blogIdList.reduce(async (acc, blog_id) => {
        let followers = await FollowBlog.readFollowers(Opts.findBlogFollowersByBlogId(blog_id))
        followers = followers.map(({ id }) => id)
        let res = await acc
        for (let id of followers) {
            res.push(id)
        }
        return res
    }, [])

    let cache = {
        [CACHE.TYPE.NEWS]: subscripters,
        [CACHE.TYPE.PAGE.USER]: [authorId]
    }

    let datas = blogIdList.map(id => ({ id, user_id: authorId }))
    let ok = await Blog.deleteBlogs(datas)

    if (!ok) {
        return new ErrModel(REMOVE_ERR)
    }
    return new SuccModel({ cache })
}
//  移除blog內的圖片
async function removeImgs(cancelImgs) {
    let resModel
    for (let { blogImg_id, blogImgAlt_list } of cancelImgs) {
        resModel = await Controller_BlogImgAlt.cancelWithBlog(blogImg_id, blogImgAlt_list)
        if (resModel.errno) {
            break
        }
    }
    return resModel
}




async function findBlogsHasPhoto(userId, options) {
    let blogs = await Blog.readBlogs(Opts.BLOG.findBlogsHasPhoto(userId))
    let data = Init.browser.blog.organizedList(blogs, options)

    return new SuccModel({ data })
}


