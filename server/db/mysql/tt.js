const { BlogImgAlt } = require('./model')
const { createBlogImgAlt, readBlogImgAlt } = require('../../server/blogImgAlt')
async function go() {
    try {
        let res = await BlogImgAlt.findAndCountAll({where: {id: 68}})
        console.log('@ 創建的 blogImgAlt => ', res)
        // blogImgAlt = await readBlogImgAlt({id: 1 })
        // console.log('@ 找到的 blogImgAlt => ', blogImgAlt)
        // console.log('@ ok => res => ', res)
    } catch (err) {
        console.log(err)
    }
}

go()

