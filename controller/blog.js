const { Op } = require('sequelize')
const my_xxs = require('../utils/xss')

const { set_blog, tellBlogFollower } = require('../server/cache')

const { hash_obj } = require('../utils/crypto')
const {
    readFans
} = require('../server/user')

const {
    createBlog,
    deleteBlog,
    deleteBlogs,
    updateBlog,
    readBlog,
    readBlogList,
} = require('../server/blog')

const {
    deleteBlogImg,
    updateBulkBlogImg
} = require('../server/blogImg')

const {
    createFollowers,
    restoreBlog,
    hiddenBlog,
    readFollowers
} = require('../server/followBlog')

const { SuccModel, ErrModel } = require('../model')
const { BLOG, BLOGIMG } = require('../model/errRes')

/** 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function addBlog(title, user_id) {
    try {
        title = my_xxs(title)
        const blog = await createBlog({ title, user_id })
        return new SuccModel(blog)
    } catch (e) {
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
}

/** 刪除 blog
 * @param {number} blog_id 
 * @returns {object} SuccModel || ErrModel
 */
async function removeBlog(blog_id) {
    let notifiedIdList = await readFollowers({ blog_id })
    if(notifiedIdList.length){
        notifiedIdList = [ ...new Set(notifiedIdList)]
    }
    let res
    if (Array.isArray(blog_id)) {
        res = await deleteBlogs({ blogList_id: blog_id })
    } else {
        res = await deleteBlog(blog_id)
    }
    if (!res) {
        return new ErrModel(BLOG.BLOG_REMOVE_ERR)
    }
    return new SuccModel({notifiedIdList})
}

/** 更新 blog
 * 
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modifyBlog(blog_id, blog_data, author_id) {
    let { title, listOfBlogImg, html, show } = blog_data

    //  文章內沒有的圖片，刪除關聯
    if (listOfBlogImg && listOfBlogImg.cancel.length) {
        let res = await deleteBlogImg({ listOfId: listOfBlogImg.cancel })
        if (!res) {
            return new ErrModel(BLOGIMG.REMOVE_ERR)
        }
    }

    //  更新文章內圖片的新資訊
    if (listOfBlogImg && listOfBlogImg.update.length) {
        let res = await updateBulkBlogImg(listOfBlogImg.update)
        if (!res) {
            return new ErrModel(BLOGIMG.UPDATE_ERR)
        }
    }

    let data = {}

    if (title) {
        data.title = my_xxs(title)
    }

    if (html) {
        data.html = my_xxs(html)
    }

    let responseData = {}
    //  依show處理如何更新 BlogFollow
    if (show > 0) {
        //  取得粉絲群
        let followerList = await readFans(author_id)
        //  取得粉絲群的id
        let listOfFollowerId = []
        if (followerList.length) {
            listOfFollowerId = followerList.map(({ id }) => id)
        }
        responseData.notifiedIdList = listOfFollowerId
        console.log('@listOfFollowerId => ', listOfFollowerId)
        if (show === 1) {
            /* 初次公開，將文章與粉絲作關聯 */
            data.show = true

            if (listOfFollowerId.length) {

                //  將粉絲與文章作關聯
                let res = await createFollowers({ blog_id, listOfFollowerId })
                if (!res) {
                    return new ErrModel(BLOG.UPDATE.ERR_CREATE_BLOGFOLLOW)
                }
            }
            //  建立文章公開數據
            data.showAt = new Date()

        } else if (show === 2) {
            /*  公開過又隱藏 */
            data.show = false

            //  FollowBlog 軟刪除 confirm: false 的 粉絲
            await hiddenBlog({ blog_id, confirm: false })
        } else if (show === 3) {
            //  不是第一次公開
            data.show = true

            //  restory 此 blog 的 FollowBlog.follower，且將這些follower取出
            await restoreBlog({ blog_id })

            //  找出目前 BlogFollower
            let listOfBlogFollowerId = await readFollowers({ blog_id })
            
            //  篩去兩者重複的id
            let listOfNewFollowerId = listOfFollowerId.reduce((initVal, id) => {
                if (!listOfBlogFollowerId.includes(id)) {
                    initVal.push(id)
                }
                return initVal
            }, [])

            if (listOfNewFollowerId.length) {
                //  新增FollowBlog.follower
                await createFollowers({ blog_id, listOfFollowerId: listOfNewFollowerId })
            }
        }
        await tellBlogFollower(blog_id)
    }

    //  更新文章數據
    await updateBlog(blog_id, data)
    let blog = await readBlog({ blog_id }, true)
    responseData.blog = blog
    return new SuccModel(responseData)
}

/** 取得 blog 紀錄
 * 
 * @param {number} blog_id blog id
 * @returns 
 */
async function getBlog(blog_id, needCommit = false) {
    let blog = await readBlog({ blog_id }, needCommit)
    if (blog) {
        return new SuccModel({blog})
    } else {
        return new ErrModel(BLOG.NOT_EXIST)
    }
}

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
async function getBlogListByUserId(user_id, is_author = false) {
    let param = { user_id }

    if (is_author) {
        param.allBlogs = true
    }

    let blogList = await readBlogList(param)

    let data = { show: [], hidden: [] }

    let page = { show: 0, hidden: 0 }

    blogList.forEach(item => {
        let { show } = item
        let key = show ? 'show' : 'hidden'
        delete item.show
        if (!data[key][page[key]]) {
            data[key][page[key]] = []
        }
        if (data[key][page[key]].length === 5) {
            page[key] += 1
            data[key][page[key]] = []
        }
        data[key][page[key]].push(item)
    })

    return new SuccModel(data)
}

module.exports = {
    addBlog,
    modifyBlog,
    removeBlog,
    getBlog,
    getBlogListByUserId
}