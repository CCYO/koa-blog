const {
    User, Blog, Img, BlogImg, seq
} = require('./tt-model')

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

//  (2) (3)
//  使用時機：進入富文本編輯器 & 填完標題
//  請求data：{ name: 標題名稱 } & session.user.id
//  響應data：{ id: blogIns.id }
/**
 * @description 初次建立 blog & 與 user 建立連結
 * @param { name: String } blog 標題
 * @param { Number } user 使用者ID  
 * @returns Model Blog Ins
 */
async function createBlog(blog, userId) {
    let user = await User.findByPk(userId)
    blog = await user.createBlog(blog)
    return blog
}

// 正常來說 upload 
// (1) 先檢查前端資料，但初次絕對沒有
// (2) 前端算好hash，並送來後端
// (3) 後端查詢 Img Table，若有就不用upload GCS，只需要串聯 img : blog

/**
 * @description 找尋 DB 內使否曾有存入過此圖片
 * @param {String} img_hash 圖片hash值
 * @returns {Object} 回傳 { hash, url }
 */
async function findImg(img_hash){
    const img = await Img.findOne({
        where: { hash: img_hash },
        attributes: ['hash', 'url'],
        raw: true
    })
    if(img){
        return { id: img.id, hash: img.hash, url: img.url }
    }else{
        return false
    }
}

// (4) (5) (6)
/**
 * @description upload imgage 使用
 * @param { Number } blog_id
 * @param { String } img_hash
 * @returns { Number } blogImg.id
 */
async function uploadImg(blog_id, img_hash) {
    //  先確認 DB 是否有此圖片，若有就不用建立 img
    let img = await findImg(img_hash)
    if(!img){
        // upload img to GCE
        img = { hash: img_hash, url: img_hash + '-url'}
        //  Img Table 創建 img
        img = await Img.create(img)
    }    
    //  建立 blog : img = M : N
    let blog = await Blog.findByPk(blog_id)  
    let blogImgs = await blog.addImg(img)
    //  RV 為 img data
    return blogImgs[0].id
}

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

(
    async () => {
        try {
            await go()
        } catch (e) {
            console.log('@ERR => ', e)
        }
    }
)()

//  (5)
async function createImgname() { }
const data = [
    {
        user: { name: '瑞娟' },
        blog: { name: '活動組管理' },

    }
]

const users = [
    ,
    { name: '晟祐' },
    { name: '妙妃' },
    { name: '家榮' },
    { name: '厚亮' }
]
const blogs = [

    { name: '會館管理' },
    { name: '教學大樓管理' },
    { name: '臉書管理' },
    { name: '團體管理' }
]
const imgs = [
    { url: 'Team', hash: 'img1', },
    { url: 'Marry', hash: 'img2' },
    { url: 'OfficeRoom', hash: 'img3' },
    { url: 'FB', hash: 'img4' },
    { url: 'PlayActive', hash: 'img5' }
]

const imgnames_4_T = [
    { name: '活動組_img_1' },
    { name: '活動組_img_2' },
    { name: '活動組_img_3' },
    { name: '活動組_img_4' },
    { name: '活動組_img_5' }
]
const imgnames_4_M = [
    { name: '會館_img_1' },
    { name: '會館_img_1' },
    { name: '會館_img_3' },
    { name: '會館_img_4' },
    { name: '會館_img_5' },
]
const imgnames_4_O = [
    { name: '教學大樓_img_1' },
    { name: '教學大樓_img_2' },
    { name: '教學大樓_img_3' },
    { name: '教學大樓_img_4' },
    { name: '教學大樓_img_5' },
]

const imgnames_4_F = [
    { name: '臉書_img_1' },
    { name: '臉書_img_2' },
    { name: '臉書_img_3' },
    { name: '臉書_img_4' },
    { name: '臉書_img_5' },
]
const imgnames_4_P = [
    { name: '團體活動_img_1' },
    { name: '團體活動_img_2' },
    { name: '團體活動_img_3' },
    { name: '團體活動_img_4' },
    { name: '團體活動_img_5' },
]
function a() {
    Promise
        .all([createUserAndBlog(users, blogs), createImgAndName(imgs)])
        .then(async () => {
            const blog = await Blog.findOne({
                where: { name: '活動組管理' }
            })
            const img = await Img.findOne({
                where: { hash: 'TTT' },
                attributes: ['id'],
                raw: true
            })
            console.log('@img => ', img)
            let imgnames = await Imgname.findAll({
                where: { img_id: img.id },
                raw: true,
                attributes: ['id']
            })
            imgnames = imgnames.map(({ id }) => id)
            const res = await blog.addImgnames(imgnames)
        })
        .then(async () => {
            let {
                dataValues: {
                    name,
                    Imgnames: Imgnames_arr
                }
            } = await Blog.findOne({
                where: { id: 1 },
                attributes: ['name'],
                include: {
                    model: Imgname,
                    attributes: ['name'],
                    include: {
                        model: Img,
                        attributes: ['hash', 'url']
                    }
                }
            })

            /**
             * 每個 Table 的資料都會被放在 dataValues 內
             * Blog {
             *   dataValues: {
             *     name: blogname,
             *     //  Blog : Imgname = 1 : N 所以撈出的 Imgname data 會被封裝在 Imgname"s" 的 dataValues 內，且 dataValues 是 arr
             *     Imgnames: 
             *       dataValues : [
             *         {
             *           name: imgname,
             *           //  Imgname : img = N : 1 所以撈出來的 Img data 會被封裝在 Img，且 dataValues 是 obj
             *           Img: {
             *             dataValues: {
             *               hash: xxx,
             *               url: xxx
             *             }
             *           }
             *         }, ... { imgname data }, ...
             *       
             *     }
             *   }
             * }
             */

            let blog = { name }
            let imgnames = Imgnames_arr.map(({ dataValues }) => ({ name: dataValues.name }))
            let imgs = Imgnames_arr.map(
                ({
                    dataValues: {
                        Img: {
                            dataValues: {
                                hash, url
                            }
                        }
                    }
                }) => ({ img: { hash, url } }))

            console.log('@blog => ', blog)
            console.log('@imgnames_arr => ', Imgnames_arr)
            console.log('@imgnames => ', imgnames)
            console.log('@imgs => ', imgs)
            console.log('------------------------------------------------------------')
        })
        .then(_ => console.log('OK'))
        .catch(e => console.log('安屁安', e))

}

async function createUserAndBlog(users, blogs, imgnames) {
    return await Promise.all(
        users.map(async ({ name }, ind) => {
            //  創建user
            const user = await User.create({ name })
            //  創建blog
            let blog = await Blog.create({ name: blogs[ind].name })
            let blogCreateImgnames = await blog.createImgnames(imgnames)
            blog = await blog.setUser(user)
            return { blog, user }
        })
    )
}

async function createImgAndName(imgs) {
    const p = await Promise.all(
        imgs.map(async ({ hash, url, name }, ind) => {
            const img = await Img.create({ hash, url })
            let imgnames = await Promise.all(
                name.map(
                    async (v) => await Imgname.create({ name: v })
                )
            )
            return await img.addImgnames(imgnames)
        })
    )
    return
}



