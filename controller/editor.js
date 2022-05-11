const {
    createBlog, updateBlog: updateBlog_S
} = require('../server/editor')

const { SuccModel, ErrModel } = require('../model')
const {
    BLOG
} = require('../model/errRes')
//  (2) (3)
//  使用時機：進入富文本編輯器 & 填完標題
//  請求data：{ name: 標題名稱 } & session.user.id
//  響應data：{ id: blogIns.id }
/**
 * @description 初次建立 blog & 與 user 建立連結
 * @param { String } title 標題
 * @param { Number } userId 使用者ID  
 * @returns
 *  SuccModel for { data: { id: blog.id }} || ErrModel
 */
async function addBlog(title, userId) {
    try{
        const blog = await createBlog(title, userId)
        return new SuccModel({id: blog.id})
    }catch(e){
        console.log('@創建Blog時發生錯誤 => ', e)
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e})
    }
}

async function updateBlog(data, blog_id){
    const raw = await updateBlog_S(data, blog_id)
    if(raw){
        return new SuccModel()
    }else{
        return new ErrModel()
    }
}

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



module.exports = {
    addBlog,
    updateBlog,
    uploadImg
}