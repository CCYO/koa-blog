const { BLOG: { TIME_FORMAT } } = require('../../conf/constant')
const date = require('date-and-time')
const init_user = require('./user')
const init_commentForBrowser = require('./comment')
const { init_newsOfFollowId, init_excepts } = require('./news')
//  0326
function init(data, _init) {
    if (Array.isArray(data)) {
        return init_datas(data, _init)
    } else {
        return init_data(data, _init)
    }
}
//  0326
function init_datas(datas, _init) {
    if (!datas.length) {
        return []
    }
    return datas.map(data => init_data(data, _init))
}
//  0326
function init_data(data, _init) {
    if (!data) {
        return null
    }
    let res = data.toJSON ? data.toJSON() : data
    if (_init) {
        res = _init(res)
    }
    return res
}
//  0326
function initComment(data) {
    return init(data, go)
    function go(comment) {
        let data = { ...comment }
        let map = new Map(Object.entries(data))
        if (map.has('p_id')) {
            let pid = map.get('p_id')
            data.p_id = pid === null ? 0 : pid
        }
        if (map.has('User')) {
            let commenter = init_user(map.get('User'))
            delete data.User
            data.commenter = commenter
        }
        if (map.has('Blog')) {
            let blog = map.get('Blog')
            delete data.Blog
            data.blog = { author: init_user(blog.author), title: blog.title, id: blog.id }
        }
        return data
    }
}
//  0326
function initCommentsForBrowser(data) {
    let comments = initComment(data)
    return init_commentForBrowser(comments)
}
//  0326
function initBlog(data) {
    let res = init(data, go)
    return res
    function go(data) {
        let blog = { ...data }
        let map = new Map(Object.entries(blog))
        if (map.has('author')) {
            let author = map.get('author')
            blog.author = initUser(author)
        }
        if (map.has('show')) {
            if (map.get('show')) {
                blog.showAt = date.format(blog.showAt, TIME_FORMAT)
            } else {
                blog.updatedAt = date.format(blog.updatedAt, TIME_FORMAT)
            }
        }
        if (map.has('BlogImgs')) {
            delete blog.BlogImgs
            let imgs = _initBlogImg(map.get('BlogImgs'))
            blog.imgs = imgs.flat()
        }
        return blog
    }
}
//  0326
function _initBlogImg(blogImg) {
    return init(blogImg, go)
    function go(blogImg) {
        let { blogImg_id, name, ...otherData } = blogImg
        let res = { blogImg_id, name }
        let map = new Map(Object.entries(otherData))
        if (map.has('Img')) {
            let img = init(map.get('Img'))
            res = { ...res, ...img }
        }
        if (map.has('BlogImgAlts')) {
            let alts = init(map.get('BlogImgAlts'))
            res = alts.map(item => {
                if (!item.alt) {
                    item.alt = name
                }
                return { ...res, ...item }
            })
        }
        //  { id, alt, blogImg_id, name, img_id, url, hash}
        return res
    }
}
//  0326
function initUser(data) {
    return init(data, init_user)
}



module.exports = {
    blogImgAlt: init,       //  0326
    blogImg: init,          //  0326
    img: init,              //  0326
    user: initUser,         //  0326
    blog: initBlog,         //  0326
    comment: initComment,   //  0326
    browser: {
        comment: initCommentsForBrowser //  0326
    },
    init_newsOfFollowId,
    init_excepts
}