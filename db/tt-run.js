const {
    User, Blog, Img, Imgname, BlogImgname, seq
} = require('./tt-model')

const users = [
    { name: '瑞娟' },
    { name: '晟祐' },
    { name: '妙妃' },
    { name: '家榮' },
    { name: '厚亮' }
]
const blogs = [
    { name: '活動組管理' },
    { name: '會館管理' },
    { name: '教學大樓管理' },
    { name: '臉書管理' },
    { name: '團體管理' }
]
const imgs = [
    { url: 'Team', hash: 'TTT', name: ['活動組', '對外窗口團隊', '機動組'] },
    { url: 'Marry', hash: 'MMM', name: ['森林會館', '花堤會館', '外燴場地'] },
    { url: 'OfficeRoom', hash: 'OOO', name: ['教學大樓', '辦公室租用空間'] },
    { url: 'FB', hash: 'FFF', name: ['臉書', '臉書管理', '粉絲頁管理'] },
    { url: 'PlayActive', hash: 'PPP', name: ['團體活動', '繽紛巧手', '綠手作'] }
]

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


async function createUserAndBlog(users, blogs) {
    return await Promise.all(
        users.map(async ({ name }, ind) => {
            const user = await User.create({ name })
            let blog = await Blog.create({ name: blogs[ind].name })
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



