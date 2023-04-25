const { initListForBrowser } = require('./comment')                                             //  0411
const { 
    //  0404
    pageTable,

    sortAndInitTimeFormat
} = require('./blog')
const { filterEmptyAndFranferFns, filterEmptyAndFranferFnsForArray } = require('../filterEmpty')  //  0404
const { USER: { AVATAR } } = require('../../conf/constant')     //  0404
//  0409
function initAlt(data){
    return init(data, go)
    function go(item){
        let data = { ...item }
        let map = new Map(Object.entries(item))
        //  { alt_id, alt, BlogImg: { blogImg_id, name , Img: { img_id, url, hash }} }
        if(map.has('BlogImg')){
            let { Img, ...blogImg } = item.BlogImg
            data = { ...data, ...blogImg, ...Img }

            if(map.has('alt') && !data.alt){
                data.alt = item.BlogImg.name
            }
            delete data.BlogImg
        }
        return data
    }
}
//  0404
function initComment(data) {
    return init(data, go)
    function go(comment) {
        let data = { ...comment }
        let map = new Map(Object.entries(data))
        if (map.has('pid')) {
            data.pid = comment.pid === null ? 0 : pid
        }
        if (map.has('commenter')) {
            data.commenter = initUser(data.commenter)
        }
        if (map.has('article')) {
            data.article = initBlog(data.article)
            // if(data.article.author){
            //     data.article.author = initUser(data.article.author) 
            // }
        }
        return data
    }
}
//  0404
function initBlog(data) {
    return init(data, go)
    function go(data) {
        let blog = { ...data }
        let map = new Map(Object.entries(blog))
        if (map.has('author') && blog.author) {
            blog.author = initUser(blog.author)
        }
        if (map.has('BlogImgs')) {
            blog.imgs = _initBlogImg(data.BlogImgs)
            delete blog.BlogImgs
        }
        if(map.has('replys')){
            blog.replys = initComment(data.replys)
        }
        return blog
    }
}
//  0404
function _initBlogImg(blogImgs) {
    //  正常來說，blogImgs會是arr
    return initArr(blogImgs, go)
    function go(blogImgs) {
        let container = []
        for (let blogImg of blogImgs) {
            let map = new Map(Object.entries(blogImg))
            let res = {}
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
                for (let imgAlt of imgAlts) {
                    if (!imgAlt.alt) {
                        imgAlt.alt = res.name
                    }
                    container.push({ ...res, ...imgAlt})
                }
                continue
            }
            /*
            ** res: { 
            **     // alt.id → alt_id 是在 Opts.findWholeInfo 轉換的
            **     alt_id, alt,
            **     // blogImg.id → blogImg_id 是在 Opts.findWholeInfo 轉換的
            **     blogImg_id, name,
            **     // img.id → img_id 是在 Opts.findWholeInfo 轉換的
            **     img_id, url, hash
            ** }
            */
            container.push(res)
        }
        return container
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
    return filterEmptyAndFranferFnsForArray(arr, ...fns)
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

module.exports = {
    //  0423
    articleReader: init,
    //  0423
    idolFans: init,
    //  0409
    alt: initAlt,
    //  0404
    comment: initComment,
    browser: {
        //  0411
        comment: initListForBrowser,
        //  0404
        blog: {
            //  0404
            pageTable,

            sortAndInitTimeFormat
        }
    },
    //  0404
    user: initUser,
    //  0404
    blog: initBlog,

    msgReceiver: init,    //  0328
    blogImgAlt: init,       //  0326
    blogImg: init,          //  0326
    img: init,              //  0326
    
    
    
    init_newsOfFollowId,
    init_excepts
}






