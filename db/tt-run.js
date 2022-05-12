const { Op } = require('sequelize')

const {
    User, Blog, Img, BlogImg, seq
} = require('./model')

/**
 * 實作順序
 * (1) 創建 user
 * (2) 創建 blog
 * (3) 關聯 user & blog
 * (4) 創建 img（upload img 時就會創建）
 * (5) 創建 imgname 
 * (6) 關聯 img 與 imgname
 * (7) 修改 imgname
 * (8) 關聯 blog 與 imgnames 
 */

//  (1)
async function createUser(user) {
    return await User.create(user)
}


// 正常來說 upload 
// (1) 先檢查前端資料，但初次絕對沒有
// (2) 前端算好hash，並送來後端
// (3) 後端查詢 Img Table，若有就不用upload GCS，只需要串聯 img : blog


/**
 * 
 * @param {Number} blogImg_id
 * @param {Object} img_desc
 * @param {String} img_desc.alt
 * @param {String} img_desc.href
 * @returns {Object} 
 */
async function updateImgname(blogImg_id, img_desc){
    let blogImg = await BlogImg.update( img_desc , { where: { id: blogImg_id}})
    return true
}

/**
 * 
 * @param {Object} param0 
 * @param {String} param0.html html
 * @param {Number} param0.blog_id blog id
 */
async function uploadHtml({html, blog_id: id}){
    //  RV 為 arr, arr[0] 為 number, 代表更新幾條 row
    console.log('@ id => ', id)
    await Blog.update({html}, { where: {id}} )
}

// 撈取 Blog 內的 img data
/**
 * 
 * @param {Number} blog_id 
 * @returns blog raw data
 */
async function getBlog(blog_id) {
    return await Blog.findByPk(blog_id, {
        attributes: ['name'],
        include: {
            model: Img,
            attributes: ['hash', 'url'],
            raw: true,
            through: {
                attributes: ['alt', 'href'],
                raw: true
            }
        },
        raw: true
    })
}

async function go() {
    const user = await createUser({ name: '祐' })
    const blog = await createBlog({ name: '祐的文章' }, user.id)
    const blogImg_id1 = await uploadImg(blog.id, 'img1-hash')
    const update_Imgname1 = await updateImgname(blogImg_id1, { alt: 'img1-alt', href: 'www-img1' })
    const blogImg_id2 = await uploadImg(blog.id, 'img2-hash')
    const update_Imgname2 = await updateImgname(blogImg_id2, { alt: 'img2-alt', href: 'www-img2' })
    let raw_blog = await getBlog(blog.id)
    console.log(raw_blog['Imgs.hash'])
    

    console.log('GG')
}

async function findBlogs(user_id){
    let blogs = await Blog.findAll({
        attributes: ['id', 'title'],
        where: {
            '$User.id$' : user_id // {[Op.eq]: user_id }
        },
        include: {
            model: User,
            attribute: ['eamil'],
            where: { id: user_id}
        }
    })
    console.log('@blogs 未處理 => ', blogs)
    blogs = blogs.map(({dataValues: { id, title, User}}) => {
        let blog = { id, title }
        let { dataValues: { email }} = User
        let user = { email }
        return { blog, user} 
    })
    console.log('@blogs => ', blogs)
}

async function readBlog(blog_id){
    let blog = await Blog.findByPk(blog_id, {
        attributes: ['id', 'title', 'html'],
        include: {
            model: Img,
            attributes: ['id', 'url', 'hash'],
            through: {
                model: BlogImg,
                attributes: ['id', 'name']
            }
        }
    })
    console.log('@blog 未整理 => ', blog)
    blog.Imgs = blog.Imgs.map( ({
        dataValues: {
            id: img_id, url, hash,
            BlogImg: {
                dataValues: {
                    id: blogImg_id, name
                }
            }
        }
    }) => {
        return { img_id, hash, blogImg_id, alt, href }
    })
    return { id: blog.id, title: blog.title , html: blog.html, imgs: blog.Imgs}
}

(
    async () => {
        try {
            let blog = await readBlog(20)
            console.log('@blog => ', blog)
        } catch (e) {
            console.log('@ERR => ', e)
        }
    }
)()