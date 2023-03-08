const FollowBlog = require('../server/followBlog')
const {
    organizedList,  //  0303    
    initTimeFormatAndSort   //  0303
} = require('../utils/sort')
const {
    BLOG,       //  0228
    BLOGIMGALT
} = require('../model/errRes')
const {
    SuccModel,  //  0228
    ErrModel    //  0228
} = require('../model')
const Opts = require('../utils/seq_findOpts')   //  0303
const Blog = require('../server/blog')          //  0303

const my_xxs = require('../utils/xss')          //  0303

const {
    readFans
} = require('../server/user')

const {
    updateBlog,
    readBlog
} = require('../server/blog')

const {
    deleteBlogImg
} = require('../server/blogImg')

const {
    deleteBlogImgAlt,
    readBlogImgAlt
} = require('../server/blogImgAlt')

const {
    createFollowers,
    hiddenBlog
} = require('../server/followBlog')



const { modifyCache } = require('../server/cache')

const { CACHE } = require('../conf/constant')

//  0303
async function getSquareBlogList(exclude_id) {
    let blogs = await Blog.readBlogs(Opts.findPublicBlogListByExcludeId(exclude_id))
    blogs = initTimeFormatAndSort(blogs)
    return new SuccModel({ data: blogs})
}
/** 刪除 blogs  0303
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
    return new SuccModel({cache})
}
/** 取得 blogList   //  0303
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
 async function getBlogListByUserId(user_id, beOrganized = true) {
    let blogList = await Blog.readBlogs(Opts.findBlogListByAuthorId(user_id))
    if(beOrganized){
        blogList = organizedList(blogList)
    }
    return new SuccModel({ data: blogList })
}
/** 取得 blog 紀錄  0303
 * 
 * @param {number} blog_id blog id
 * @returns 
 */
 async function getBlog({blog_id, author_id}) {
    let blog = await Blog.readBlog(Opts.findBlog({blog_id, author_id}))
    if (blog) {
        return new SuccModel({ data: blog})
    } else {
        return new ErrModel(BLOG.NOT_EXIST)
    }
}
/** 建立 blog   0303
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function addBlog(title, user_id) {
    try {
        title = my_xxs(title)
        const blog = await Blog.createBlog({ title, user_id })
        const cache = { [CACHE.TYPE.PAGE.USER]: [user_id] }
        return new SuccModel({data: blog, cache})
    } catch (e) {
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
}


/** 更新 blog
 * 
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modifyBlog(blog_id, blog_data, author_id) {
    let { title, cancelImgs = [], html, show } = blog_data

    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    await cancelImgs.reduce(async (img) => {
        let { blogImg_id, blogImgAlt_list } = img
        //  確認在BlogImgAlt內，同樣BlogImg的條目共有幾條
        let { length: blogImgCount } = await readBlogImgAlt({ where: { blogImg_id } })

        // let { count } = await BlogImgAlt.findAndCountAll({ where: { blogImg_id } })
        let res
        if (blogImgCount === blogImgAlt_list.length) {  //  BlogImg條目 === 要刪除的BlogImgAlt數量，代表該Blog已沒有該張圖片
            //  刪除整筆 BlogImg
            res = await deleteBlogImg({ id: blogImg_id })
        } else {  //  BlogImg條目 !== 要刪除的BlogImgAlt數量，代表該Blog仍有同樣的圖片
            res = await deleteBlogImgAlt({ blogImgAlt_list })
        }
        if (!res) { //  代表刪除不完全
            throw new Error(BLOGIMGALT.REMOVE_ERR)
        }
        return Promise.resolve()
    })

    //  粉絲群的id
    let followerIdList = []
    //  用於更新Blog
    let data = {}
    //  用於緩存處理
    let cache = { blog: [blog_id] }

    let needUpdateShow = blog_data.hasOwnProperty('show')
    //  若預更新的數據有 show 或 title
    if (needUpdateShow || title) {
        //  取得粉絲群
        let followers = await readFans({
            attributes: ['id'],
            where: { idol_id: author_id }
        })
        //  取得粉絲群的id
        followerIdList = followers.map(({ id }) => id)

        //  提供緩存處理
        await modifyCache({
            [CACHE.TYPE.NEWS]: followerIdList,
            [CACHE.TYPE.USER]: [author_id]
        })
    }

    if (title) {
        //  存放 blog 要更新的數據
        data.title = my_xxs(title)
    }

    //  依show處理更新 BlogFollow
    if (needUpdateShow) {
        //  存放 blog 要更新的數據
        data.show = show
        if (show) { // 公開blog
            //  要更新的資料
            // let Dates = followerIdList.map(follower_id => ({ blog_id, follower_id, deletedAt: null }))
            //  更新資料之 blog_id + follower_id 主鍵對若不存在，則新建，反之更新
            // await FollowBlog.bulkCreate(updateDate, {  })
            if (followerIdList.length) {
                let ok = await createFollowers({ blog_id, listOfFollowerId: followerIdList, updateData: { deletedAt: null }, opts: { updateOnDuplicate: ['deletedAt'] } })
                if (!ok) {
                    return new ErrModel(BLOG.UPDATE.ERR_CREATE_BLOGFOLLOW)
                }
            }
            //  存放 blog 要更新的數據
            data.showAt = new Date()
        } else { // 隱藏blog
            //  軟刪除既有的條目
            let ok = await hiddenBlog({ blog_id, confirm: false })
            if(!ok){
                return new ErrModel(BLOG.UPDATE.ERR_SOFT_DELETE_BLOGFOLLOW)
            }
        }
    }

    if (html) {
        //  存放 blog 要更新的數據
        data.html = my_xxs(html)
    }

    //  更新文章
    let ok = await updateBlog({blog_id, data})
    if(!ok){
        return new ErrModel()
    }
    // let blog = await readBlog({ blog_id }, true)
    let blog = await readBlog({
        attributes: [ 'id', 'title', 'html', ],
        where: { blog_id },

    })
    return new SuccModel(blog, cache)
}


module.exports = {
    modifyBlog,

    getSquareBlogList,      //  0303
    removeBlogs,            //  0303
    getBlogListByUserId,    //  0303
    getBlog,                 //  0303
    addBlog
}