
const Opts = require('../utils/seq_findOpts')   //  0228
const {
    BLOG,       //  0228
    BLOGIMGALT
} = require('../model/errRes')
const { SuccModel, ErrModel } = require('../model') //  0228
const Blog = require('../server/blog')  //  0228

const my_xxs = require('../utils/xss')
const date = require('date-and-time')

const {
    readFans
} = require('../server/user')

const {
    createBlog,
    deleteBlog,
    deleteBlogs,
    updateBlog,
    readBlog
} = require('../server/blog')

const {
    deleteBlogImg,
    updateBulkBlogImg
} = require('../server/blogImg')

const {
    deleteBlogImgAlt,
    readBlogImgAlt
} = require('../server/blogImgAlt')

const {
    createFollowers,
    restoreBlog,
    hiddenBlog,
    readFollowers
} = require('../server/followBlog')

const { modifyCache } = require('../server/cache')

const { CACHE } = require('../conf/constant')



/** 取得 blogList   0228
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
async function getBlogListByUserId(user_id) {
    let blogList = await Blog.readBlogs(Opts.findBlogListByAuthorId(user_id))

    //  將blog依show分纇
    blogList = blogList.reduce((initVal, item) => {
        let key = item.show ? 'show' : 'hidden'
        //  移除show屬性
        delete item.show
        initVal[key].push(item)
        return initVal
    }, { show: [], hidden: [] })

    let data = { show: [[]], hidden: [[]] }
    for (let key in blogList) {
        let blogs = blogList[key]
        let prop = undefined
        if (key === 'show') {
            prop = 'showAt'
        } else {
            prop = 'createdAt'
        }
        blogs.sort((a, b) => {
            return new Date(b[prop]) - new Date(a[prop])
        })
        let page = { show: 0, hidden: 0 }
        blogs = blogs.reduce((initVal, item) => {
            //  移除show屬性
            delete item.show
            if (item.showAt) {
                item.showAt = date.format(new Date(item.showAt), 'YYYY/MM/DD HH:mm:ss')
            }
            item.createdAt = date.format(new Date(item.createdAt), 'YYYY/MM/DD HH:mm:ss')
            //  若指定的ArrayItem內已有5筆資料，則該show分纇的頁碼+1，並創建該頁碼的ArrayItem
            if (initVal[page[key]].length === 5) {
                page[key] += 1
                initVal[page[key]] = []
            }
            initVal[page[key]].push(item)
            console.log('@=> initVal', initVal)
            return initVal
        }, [[]])

        if (blogs[0].length !== 0) {
            data[key] = blogs
        }
    }
    return new SuccModel({data})
}

/** 取得 blog 紀錄  0228
 * 
 * @param {number} blog_id blog id
 * @returns 
 */
async function getBlog(blog_id) {
    let blog = await Blog.readBlog(Opts.findBlog(blog_id))
    if (blog) {
        return new SuccModel({ data: blog })
    } else {
        return new ErrModel(BLOG.NOT_EXIST)
    }
}


/** 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function addBlog(title, user_id) {
    try {
        title = my_xxs(title)
        const blog = await createBlog({ title, user_id })
        let cache = { [CACHE.TYPE.PAGE.USER]: [user_id] }
        // await modifyCache({ [CACHE.TYPE.USER]: [user_id] })
        return new SuccModel({data: blog, cache})
    } catch (e) {
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
}

/** 刪除 blog
 * @param {number} blog_id 
 * @returns {object} SuccModel || ErrModel
 */
async function removeBlog(blogIdList, author) {
    if (!Array.isArray(blogIdList)) {
        blogIdList = [blogIdList]
    }

    //  處理cache -----
    //  找出 blog 的 follower
    let followerIdList = await blogIdList.reduce(async (initArr, blog_id) => {
        let followerList = await readFollowers({
            attributes: ['follower_id'],
            where: { blog_id }
        })
        let arr = await initArr
        for (let { follower_id } of followerList) {
            arr.push(follower_id)
        }
        return arr
    }, [])

    await modifyCache({
        [CACHE.TYPE.NEWS]: followerIdList,
        [CACHE.TYPE.USER]: [author]
    })

    let res = await deleteBlogs({ blogIdList })

    if (!res) {
        return new ErrModel(BLOG.BLOG_REMOVE_ERR)
    }
    return new SuccModel()
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
        followerIdList = followers.map( ({id}) => id )

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
        if (show && followerIdList.length) { // 公開blog
            //  要更新的資料
            // let Dates = followerIdList.map(follower_id => ({ blog_id, follower_id, deletedAt: null }))
            //  更新資料之 blog_id + follower_id 主鍵對若不存在，則新建，反之更新
            // await FollowBlog.bulkCreate(updateDate, {  })
            let ok = await createFollowers({ blog_id, listOfFollowerId: followerIdList, updateData: { deletedAt: null }, opts: { updateOnDuplicate: ['deletedAt'] }})
            if(!ok){
                return new Error(BLOG.UPDATE.ERR_CREATE_BLOGFOLLOW)
            }
            //  存放 blog 要更新的數據
            data.showAt = new Date()
        } else if (!show) { // 隱藏blog
            //  軟刪除既有的條目
            await hiddenBlog({ blog_id, confirm: false })
        }
    }

    if (html) {
        //  存放 blog 要更新的數據
        data.html = my_xxs(html)
    }

    //  更新文章
    await updateBlog(blog_id, data)
    let blog = await readBlog({ blog_id }, true)
    return new SuccModel(blog, cache)
}





async function getSquareBlogList(exclude_id) {
    let blogs = await readBlogList({ exclude_id })
    blogs.sort((a, b) => {
        return new Date(b.showAt) - new Date(b.showAt)
    })
    blogs.map(blog => {
        blog.showAt = date.format(new Date(blog.showAt), 'YYYY/MM/DD HH:mm:ss')
        return blog
    })

    return new SuccModel(blogs)
}

module.exports = {
    addBlog,
    modifyBlog,
    removeBlog,
    getSquareBlogList,

    getBlog,            //  0228
    getBlogListByUserId //  0228
}