const { FollowBlog } = require('./model')
const { createBlogImgAlt, readBlogImgAlt } = require('../../server/blogImgAlt')
async function go() {
    try {
        let blogImgAlt = await createBlogImgAlt({ blogImg_id: 42, alt: '888888' })
        console.log('@ 創建的 blogImgAlt => ', blogImgAlt)
        // blogImgAlt = await readBlogImgAlt({id: 1 })
        // console.log('@ 找到的 blogImgAlt => ', blogImgAlt)
        // console.log('@ ok => res => ', res)
    } catch (err) {
        console.log(err)
    }
}

go()

