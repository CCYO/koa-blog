class My {
    constructor() {
        //  初始化EJS放在頁面元素內的純字符數據，放入 promiseAll
        this.addOtherInitFn(initEJSData)
    }
    data = {}
    promiseAll = []
    //  添加初始化EJS數據以外的initFn
    async addOtherInitFn(otherInitFn) {
        try {
            let promise = otherInitFn()
            this.promiseAll.push(promise)
        } catch (e) {
            throw e
        }
    }
    async render(renderPage) {
        let allRes = await Promise.all(this.promiseAll)
        for (let res of allRes) {
            this.data = { ...this.data, ...res }
        }
        console.log('@ 完成頁面數據 初始化 => ', this.data)
        if (renderPage) {
            await renderPage(this.data)
        }
        console.log('@ 完成頁面 初渲染')
    }
}

//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}

//  將ejs傳入el[data-my-data]的純字符數據，轉化為物件數據
async function initEJSData() {
    //  從el[data-my-data]解析頁面需要的數據
    let eles = []
    $(`[data-my-data]`).each((index, el) => eles.push(el))
    let res = await eles.reduce(async (accumulator, el) => {
        //  數據的用途
        let prop = $(el).data('my-data')
        try {
            let obj
            let val = $(el).html()
            if (prop === 'blog') {  //  若與blog有關
                obj = { blog: await initBlog(val) }
            } else if (prop === 'album') {    //  若與album有關
                obj = { album: await initAlbum(val) }
            } else {
                obj = { [prop]: JSON.parse(val) }
            }
            let accumulatorRes = await accumulator
            return { ...accumulatorRes, ...obj }
        } catch (e) {
            throw e
        }
    }, {})
    //  移除所有攜帶數據的元素
    $(`[data-my-data]`).parent().remove()
    return res
    //  初始化album數據
    function initAlbum(data) {
        // JSON String → JSON Obj
        let { blog, imgs } = JSON.parse(data)
        //  img數據map化
        let map_imgs = init_map_imgs(imgs)
        return { blog, imgs, map_imgs }
    }
    //  初始化blog數據
    async function initBlog(data) {
        // JSON String → JSON Obj
        let blog = JSON.parse(data)
        //  處理blog內的img數據
        //  blog.imgs: [ img { alt_id, alt, blogImg_id, name, img_id, hash, url }]
        //  blog.map_imgs: alt_id → img
        blog.map_imgs = init_map_imgs(blog.imgs)
        //  處理blog內的comment數據
        //  將 blog.html(百分比編碼格式) → htmlStr
        blog.html = parseHtml(blog.html)
        //  確認是否為blogEdit頁
        let reg_blogEdit = /^\/blog\/edit\/\d+/
        let isBlogEditPage = reg_blogEdit.test(location.pathname)
        let reg_blogPreview = /\?preview=true/
        let isBlogPreview = reg_blogPreview.test(location.search)
        console.log('@isBlogEditPage 判斷是否為 編輯頁 => ', isBlogEditPage)
        console.log('@isBlogPreview 判對是否為 預覽頁 => ', isBlogPreview)
        console.log('@若是編輯頁或預覽頁 => 不需請求 comment')
        if (!isBlogEditPage && !isBlogPreview) {
            let res = await axios.get(`/api/comment/${blog.id}`)
            let { data: { errno, data: responseData } } = res
            if (errno) {
                alert('ERR')
                return
            }
            let { comments, commentsHtmlStr } = responseData
            blog = { ...blog, comments, commentsHtmlStr, ...mapComments(comments) }
        }
        return blog //  再將整體轉為字符

        //  因為「後端存放的blog.html數據」是以
        //  1.百分比編碼存放
        //  2.<img>是以<x-img>存放
        //  所以此函數是用來將其轉化為一般htmlStr
        function parseHtml(URI_String) {
            if (!URI_String || URI_String === 'null' || URI_String === 'undefined') {    //  若無值
                return ''
            }
            let htmlStr = decodeURI(URI_String)
            let reg = /<x-img.+?data-alt-id='(?<alt_id>\w+?)'.+?(data-style='(?<style>.?)')?.*?\/>/g
            //  複製一份
            let _html = htmlStr
            //  存放 reg.exec 的結果
            let res
            //  while 將 <x-img> 數據轉回 <img>
            while (res = reg.exec(htmlStr)) {
                let { alt_id, style } = res.groups
                //  找出對應的img數據
                let img = blog.map_imgs.get(alt_id * 1)
                //  { alt_id, alt, blogImg_id, name, img_id, hash, url}
                let { url, alt } = img
                let replaceStr = style ? `<img src='${url}?alt_id=${alt_id}' alt='${alt}' style='${style}' />` : `<img src='${url}?alt_id=${alt_id}' alt='${alt}' />`
                //  修改 _html 內對應的 img相關字符
                _html = _html.replace(res[0], replaceStr)
            }
            return _html
        }
        //  將comment數據Map化
        function mapComments(comments) {
            return comments.reduce((initVal, comment) => {
                let { map_commentId, map_commentPid } = initVal
                return set(comment)

                function set(comment) {
                    let { id, p_id: pid, reply } = comment
                    map_commentId.set(id, comment)
                    let commentsOfPid = map_commentPid.get(pid) || []
                    map_commentPid.set(pid, [...commentsOfPid, comment])
                    if (reply.length) {
                        reply.forEach(item => set(item))
                    } else {
                        map_commentPid.set(id, [])
                    }
                    return { map_commentId, map_commentPid }
                }
            }, {
                map_commentId: new Map(),
                map_commentPid: new Map().set(0, [])
            })
        }
    }

    function init_map_imgs(imgs) {
        let map_imgs = new Map()
        imgs.forEach((img, index) => {
            map_imgs.set(img.alt_id, { ...img, index })
        })
        return map_imgs
    }
}

export default My