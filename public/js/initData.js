class My {
    constructor(axios) {
        this.data = initData(axios)
    }
    data = {}
    promiseAll = []
    async init(initData) {
        try {
            let promise = initData()
            this.promiseAll.push(promise)
            let res = await promise
            for (let key in res) {
                if (key !== 'news') {
                    this.data = { ...this.data, [key]: res[key] }
                }
            }
            return res
        } catch (e) {
            throw e
        }
    }
    async check() {
        await Promise.all(this.promiseAll)
        console.log('@pageData => ', this.data)
        return this.data
    }
}

//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}

async function initData(axios) {
    let res = {}
    //  從el[data-my-data]解析頁面需要的數據
    let map = $(`[data-my-data]`).map( async (index, el) => 
    {
        //  數據的用途
        let prop = $(el).data('my-data')
        try {
            let val = $(el).html()
            if (prop === 'blog') {  //  若與blog有關
                // res.blog = await initBlog(val)
                return await initBlog(val).then( blog => ({blog}) )
            } else if(prop === 'album'){    //  若與album有關
                // res.album = initAlbum(val)
                return await initAlbum(val).then( album => ({album}))
            } else {
                res[prop] = JSON.parse(val)
                return { [prop]: JSON.parse(val)}
            }
        } catch (e) {
            throw e
        }
    })
    let resArr = await Promise.all(map)
    console.log('@resArr => ', resArr)
    //  移除所有攜帶數據的元素
    $(`[data-my-data]`).parent().remove()
    console.log('@res => ', res)
    return res
    //  初始化album數據
    function initAlbum(data){
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
        blog.map_imgs = init_map_imgs(blog.imgs)
        //  處理blog內的comment數據
        //  將 blog.html(百分比編碼格式) → htmlStr
        blog.html = parseHtml(blog.html)
        let { data: { errno, data: comments, msg }} = await axios.get(`/api/comment/${blog.id}`)
        console.log('@comments => ', comments)
        console.log('@mapComments => ', mapComments(comments))
        blog = { ...blog, ...mapComments(blog.comments) }
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
            let reg = /<x-img.+?data-id='(?<id>\w+?)'.+?(data-style='(?<style>.?)')?.*?\/>/g
            //  複製一份
            let _html = htmlStr
            //  存放結果
            let res
            //  while 將 <x-img> 數據轉回 <img>
            while (res = reg.exec(htmlStr)) {
                //  找出對應的img數據
                blog.imgs.some((img) => {
                    let { id, style } = res.groups
                    if (img.id !== id * 1) {
                        return
                    }
                    //  { id, alt, img_id, hash, url, blogImg_id, name}
                    let { url, alt } = img
                    let replaceStr = style ? `<img src='${url}?blogImgAlt=${id}' alt='${alt}' style='${style}' />` : `<img src='${url}?blogImgAlt=${id}' alt='${alt}' />`
                    _html = _html.replace(res[0], replaceStr)
                })
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
            map_imgs.set(img.id, { ...img, index })
        })
        return map_imgs
    }
}

export default My