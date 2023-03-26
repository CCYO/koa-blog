const User = require('../server/user')

const { BLOG: { NOT_EXIST, UPDATE_ERR } } = require('../model/errRes')
const Controller_FollowBlog = require('./followBlog')   //  0326
const Controller_BlogImgAlt = require('./blogImgAlt')
const Blog = require('../server/blog')              //  0324
const Opts = require('../utils/seq_findOpts')       //  0324
const {
    organizedList,          //  0324    
    initTimeFormatAndSort   //  0303
} = require('../utils/sort')
const FollowBlog = require('../server/followBlog')


const {
    SuccModel,  //  0228
    ErrModel    //  0228
} = require('../model')


const my_xxs = require('../utils/xss')          //  0303
const { CACHE } = require('../conf/constant')

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
    let blogFollowerIdList = await blogIdList.reduce(async (acc, blog_id) => {
        let followers = await FollowBlog.readFollowers(Opts.findBlogFollowersByBlogId(blog_id))
        followeridList = await acc
        for (let { follower_id } of followers) {
            followeridList.push(follower_id)
        }
        return followeridList
    }, [])

    let cache = {
        [CACHE.TYPE.NEWS]: blogFollowerIdList,
        [CACHE.TYPE.PAGE.USER]: [authorId]
    }

    let ok = await Blog.deleteBlogs({ blogIdList, authorId })

    if (!ok) {
        return new ErrModel(BLOG.BLOG_REMOVE_ERR)
    }
    return new SuccModel({ cache })
}
//  移除blog內的圖片
async function removeImgs(cancelImgs) {
    let resModel
    for (let { blogImg_id, blogImgAlt_list } of cancelImgs) {
        let resModel = await Controller_BlogImgAlt.cancelWithBlog(blogImg_id, blogImgAlt_list)
        if (resModel.errno) {
            break
        }
    }
    return resModel
}
/** 更新 blog
 * 
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modifyBlog(author_id, blog_id, blog_data) {
    // let { title, cancelImgs = [], html, show } = blog_data
    let map = new Map(Object.entries(blog_data))
    let cache = { [CACHE.TYPE.PAGE.BLOG]: blog_id }
    let fans = []
    if (map.has('title') || map.has('show')) {
        //  取得粉絲群
        let { data: fans } = await _findFansIds(author_id)
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
            if (fans.length) {
                let resModel = await Controller_FollowBlog.addSubscribers({ blog_id, fans })
                if (resModel.errno) {
                    return resModel
                }
            }
            // 隱藏blog
        } else if (!show) {
            newData.showAt = null
            let resModel = await Controller_FollowBlog.removeSubscribers(blog_id)
            //  軟刪除既有的條目
            if (resModel.errno) {
                return resModel
            }
        }
    }
    //  更新文章
    let ok = await Blog.updateBlog({ blog_id, newData })
    if (!ok) {
        return new ErrModel(UPDATE_ERR)
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
/** 取得 blog 紀錄  0303
 * 
 * @param {number} blog_id blog id
 * @returns 
 */
async function findBlog({ blog_id, author_id }) {
    let blog = await Blog.readBlog(Opts.BLOG.findBlog({ blog_id, author_id }))
    if (blog) {
        return new SuccModel({ data: blog })
    } else {
        return new ErrModel(NOT_EXIST)
    }
}
/** 建立 blog   0303
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function addBlog(title, authorId) {
    try {
        title = my_xxs(title)
        const blog = await Blog.createBlog({ title, authorId })
        const cache = { [CACHE.TYPE.PAGE.USER]: [authorId] }
        return new SuccModel({ data: blog, cache })
    } catch (e) {
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
}
/** 取得 blogList   0324
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
async function findBlogsForUserPage(userId, options) {
    let blogs = await Blog.readBlogs(Opts.BLOG.findBlogsForUserPage(userId))
    let data = organizedList(blogs, options)
    return new SuccModel({ data })
}
//  0303
async function findSquareBlogList(exclude_id) {
    let blogs = await Blog.readBlogs(Opts.findPublicBlogListByExcludeId(exclude_id))
    blogs = initTimeFormatAndSort(blogs)
    return new SuccModel({ data: blogs })
}





//  0324    若是從Controller取，會造成迴圈，不得已在這邊創建
async function _findFansIds(idol_id) {
    // user: { id, FollowPeople_F: [{ id, email, nickname, avatar }, ...] }
    let user = await User.readUser(Opts.USER.findFans(idol_id))
    let fans = user ? user.fans.map(({ id }) => id) : []
    return new SuccModel({ data: fans })
}


module.exports = {
    findBlogsForUserPage,   //  0324

    modifyBlog,
    findSquareBlogList,      //  0303
    removeBlogs,            //  0303
    findBlog,                 //  0303
    addBlog
}