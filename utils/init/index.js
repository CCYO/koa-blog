const { resetOptions, sort, initTimeFormat, pagination, organizeByTargetProp } = require('./blog')
const { filterEmptyAndFranferFns, filterEmptyAndFranferFnsForArray } = require('../filterEmpty')
const { USER: { AVATAR } } = require('../../conf/constant')
const { init_commentForBrowser, initTime: initTimeForComment } = require('./comment')
const { init_newsOfFollowId, init_excepts } = require('./news')

function organizedList(list, options) {
    let opts = resetOptions(options)
    let _pagination = (list) => pagination(list, opts)
    let organize = organizeByTargetProp(list, opts)
    for (let type in organize) {
        let items = organize[type]
        if (items.length) {
            items = sortAndInitTimeFormat(items, opts)
        }
        organize[type] = filterEmptyAndFranferFnsForArray(items, _pagination)
    }
    return organize
}

function sortAndInitTimeFormat(datas, opts) {
    let _sort = (blogs) => sort( blogs, opts)
    let list = filterEmptyAndFranferFnsForArray(datas, _sort)
    console.log('@ list => ', list)
    let gg = filterEmptyAndFranferFns(list, initTimeFormat)
    console.log('@gg => ', gg)
    return gg
    let resList = sort(list, opts)
    return initTimeFormat(resList, opts)
}
//  0326
function init(data, ...fns) {
    let _fns = [toJSON, ...fns]
    return filterEmptyAndFranferFns(data, ..._fns)

    function toJSON(data) {
        return data.toJSON ? data.toJSON() : data
    }
}
//  0326
function initUser(data) {
    return init(data, go)

    function go(json) {
        let data = { ...json }
        let map = new Map(Object.entries(data))
        //  設置默認的nickname
        if (map.has('nickname') && !map.get('nickname')) {
            let regex = /^([\w]+)@/
            let [_, target] = regex.exec(map.get('email'))
            data.nickname = target
        }
        //  設置默認的avatar
        if (map.has('avatar') && !map.get('avatar')) {
            data.avatar = AVATAR
        }
        if (map.has('Comments') && data.Comments.length) {
            let comments = data.Comments
            delete data.Comments
            data.comments = comments
        }
        return data
    }
}
//  0326
function initComment(data) {
    let s = init(data, go)
    return s
    function go(comment) {
        let data = { ...comment }
        let map = new Map(Object.entries(data))
        if (map.has('p_id')) {
            let pid = map.get('p_id')
            data.p_id = pid === null ? 0 : pid
        }
        if (map.has('User')) {
            let commenter = initUser(map.get('User'))
            delete data.User
            data.commenter = commenter
        }
        if (map.has('Blog')) {
            let blog = map.get('Blog')
            delete data.Blog
            data.blog = { author: initUser(blog.author), title: blog.title, id: blog.id }
        }
        return data
    }
}
//  0326
function initCommentsForBrowser(data) {
     let comments = initComment(data)
     comments = filterEmptyAndFranferFnsForArray(comments, init_commentForBrowser)
     filterEmptyAndFranferFns(data, initTimeForComment)
     return comments
}
//  0326
function initBlog(data) {
    return init(data, go)

    function go(data) {
        let blog = { ...data }
        let map = new Map(Object.entries(blog))
        if (map.has('author')) {
            let author = map.get('author')
            blog.author = initUser(author)
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
        let res = {}
        let map = new Map(Object.entries(blogImg))
        if (map.has('blogImg_id')) {
            res.blogImg_id = blogImg.blogImg_id
        }
        if (map.has('name')) {
            res.name = blogImg.name
        }
        if (map.has('Img')) {
            let img = init(blogImg.Img)
            res = { ...res, ...img }
        }
        if (map.has('BlogImgAlts')) {
            let alts = init(blogImg.BlogImgAlts)
            res = alts.map(item => {
                if (!item.alt) {
                    item.alt = res.name
                }
                return { ...res, ...item }
            })
        }
        //  { id, alt, blogImg_id, name, img_id, url, hash}
        return res
    }
}

module.exports = {
    followComment: init,    //  0328
    blogImgAlt: init,       //  0326
    blogImg: init,          //  0326
    img: init,              //  0326
    user: initUser,         //  0326
    blog: initBlog,         //  0326
    comment: initComment,   //  0326
    browser: {
        comment: initCommentsForBrowser, //  0326
        blog: {
            organizedList,
            sortAndInitTimeFormat
        }
    },
    init_newsOfFollowId,
    init_excepts
}