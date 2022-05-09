const {
    User, Blog, Img, Imgname, BlogImgname, seq
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
async function createUser(user){
    return await User.create(user)
}

//  (2)
async function createBlog(blog){
    return await Blog.create(blog)
}

//  (3)
async function assUserAndBlog(user, blog){
    //  RV 為 user
    return await user.addBlogs(blog)
}

// (4) (5) (6)
async function createImgAndAssImgname(img){
    img = await Img.create(img)
    let imgname = { name: img.hash }
    //  RV 為 imgname
    return await img.createImgname(imgname)
}

//  (7)
//  前端data : { blog_id, imgnames_id_arr }
async function assBlogAndImgnames(blog, imgnames){
    //  RV 為 BlogImage ins arr
    return await blog.addImgnames(imgnames)
}

// 撈取 Blog 內的 img data
async function getBlog(blog){
    blog = await Blog.findByPk(blog.id, {
        attributes: ['name'],
        include: {
            model: Imgname,
            attributes: ['name'],
            include: {
                model: Img,
                attributes: ['url', 'hash']
            }
        }
    })

    let imgnames = blog.Imgnames
    blog.imgs = imgnames.map(
        ({dataValues: {name, Img}}) => {
            let { url, hash }  = Img.dataValues
            return {name, url, hash}
        }
    )
    return { name: blog.name, imgs: blog.imgs}
}

async function go(){
    const user = await createUser({name: '祐'})
    const blog1 = await createBlog({name: '祐的文章'})
    const UorB = await assUserAndBlog(user, blog1)
    const img1 = await Img.create({ url: 'www.img1', hash: 'img1'})
    const imgname1 = await img1.createImgname({ name: 'img1'})
    const img2 = await createImgAndAssImgname({ url: 'www.img2', hash: 'img2'})
    const img3 = await createImgAndAssImgname({ url: 'www.img3', hash: 'img3'})
    const img4 = await createImgAndAssImgname({ url: 'www.img4', hash: 'img4'})
    const imgnames = await assBlogAndImgnames(blog1, [ img2, img3, img4])
    blog = await getBlog(blog1)
}


(
    async () => {
        try{
            await go()
        }catch(e){
            console.log('@ERR => ', e)
        }   
    }
)()

//  (5)
async function createImgname(){}
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
    { url: 'Marry', hash: 'img2'},
    { url: 'OfficeRoom', hash: 'img3'},
    { url: 'FB', hash: 'img4'},
    { url: 'PlayActive', hash: 'img5'}
]

const imgnames_4_T = [
    { name: '活動組_img_1'},
    { name: '活動組_img_2'},
    { name: '活動組_img_3'},
    { name: '活動組_img_4'},
    { name: '活動組_img_5'}
]
const imgnames_4_M = [
    { name: '會館_img_1'},
    { name: '會館_img_1'},
    { name: '會館_img_3'},
    { name: '會館_img_4'},
    { name: '會館_img_5'},
]
const imgnames_4_O = [
    { name: '教學大樓_img_1'},
    { name: '教學大樓_img_2'},
    { name: '教學大樓_img_3'},
    { name: '教學大樓_img_4'},
    { name: '教學大樓_img_5'},
]

const imgnames_4_F = [
    { name: '臉書_img_1'},
    { name: '臉書_img_2'},
    { name: '臉書_img_3'},
    { name: '臉書_img_4'},
    { name: '臉書_img_5'},
]
const imgnames_4_P = [
    { name: '團體活動_img_1'},
    { name: '團體活動_img_2'},
    { name: '團體活動_img_3'},
    { name: '團體活動_img_4'},
    { name: '團體活動_img_5'},
]
function a(){
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
            }) => ({ img: { hash, url }}))

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



