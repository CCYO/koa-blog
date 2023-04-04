const { USER: { AVATAR } } = require('../../conf/constant')     //  0404
const { filterEmptyAndFranferFns, filterEmptyAndFranferFnsForArray } = require('../filterEmpty')  //  0404

//  0326
function initBlog(data) {
    return init(data, go)

    function go(data) {
        let blog = { ...data }
        let map = new Map(Object.entries(blog))
        if (map.has('author') && blog.author) {
            blog.author = initUser(blog.author)
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
function _initBlogImg(blogImgs) {
    //  正常來說，blogImgs會是arr
    return initArr(blogImgs, go)
    function go(blogImgs) {
        blogImgs.map(blogImg => {
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
                let imgAlts = init(blogImg.BlogImgAlts)
                res = imgAlts.map(imgAlt => {
                    if (!imgAlt.alt) {
                        imgAlt.alt = res.name
                    }
                    return { ...res, ...item }
                })
            }
            //  { id, alt, blogImg_id, name, img_id, url, hash}
            return res
        })
    }
}
//  0404
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
        // if (map.has('comments') && data.comments.length) {
        //     let comments = data.comments
        // }
        return data
    }
}
//  0404
function initArr(data, ...fns) {
    let arr = init(data)
    return filterEmptyAndFranferFnsForArray(data, ...fns)
}
//  0404
function init(data, ...fns) {
    let _fns = [toJSON, ...fns]
    return filterEmptyAndFranferFns(data, ..._fns)

    function toJSON(data) {
        return data.toJSON ? data.toJSON() : data
    }
}

const { init_newsOfFollowId, init_excepts } = require('./news')
const { organizedList, sortAndInitTimeFormat } = require('./blog')


const { initCommentsForBrowser } = require('./comment')




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