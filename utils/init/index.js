const init_user = require('./user')

const {
    initComment,
    initCommentsForBrowser
} = require('./comment')
const _blog = require('./blog')
const { init_img } = require('./img')
const { init_blogImg } = require('./blogImg')
const { init_newsOfFollowId, init_excepts } = require('./news')

function init(data, _init) {
    if (Array.isArray(data)) {
        return init_datas(data, _init)
    } else {
        return init_data(user, _init)
    }
}

function init_datas(datas, _init) {
    if (!datas.length) {
        return []
    }
    return datas.map(data => init_data(data, _init))
}

function init_data(data, _init) {
    if (!data) {
        return null
    }
    let res = data.toJSON ? data.toJSON() : res
    if (_init) {
        res = _init(res)
    }
    return res
}

function initBlog(data) {
    let json = { ...data }
    let map = Object.entries(json)
    if (map.has('author')) {
        let author = map.get('author')
        json.author = initUser(author)
    }
    if (map.has('imgs')) {
        let blogImgs = map.get('imgs')
        let imgs = blogImgs.reduce( blogImg => {

        }, [])
        if (blogImgs && blogImgs.length) {
            let imgList = blogImgs.map(blogimg => {
                let {
                    name,
                    id: blogImg_id,
                    Img: {
                        id: img_id,
                        hash,
                        url
                    },
                    BlogImgAlts
                } = blogimg
                let blogImgAltList = init_blogImgAlt(BlogImgAlts)   // [{ id, alt },...]
                return { img_id, hash, url, blogImg_id, name, blogImgAltList }
            })
            imgList.reduce((initVal, { blogImgAltList, ...imgData }) => {
                blogImgAltList.forEach(blogImgAlt => {
                    let img = { ...blogImgAlt, ...imgData }
                    if (!img.alt) {
                        img.alt = img.name
                    }
                    initVal.push(img)
                })
                return initVal
            }, res.imgs)
        }
        json.blogImgs = initUser(blogImgs)
    }
    return json
}

function initUser(data) {
    return init(data, init_user)
}



module.exports = {
    user: initUser,
    blog: initBlog,

    initComment,
    initCommentsForBrowser,
    init_img,
    init_blogImg,
    init_newsOfFollowId,
    init_excepts
}