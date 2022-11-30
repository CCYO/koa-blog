class My {
    data = {}
    promiseIns = Promise.resolve()

    async ready() {
        return await this.promiseIns
    }
    setPromise(p) {
        this.promiseIns = p
    }
    async init() {
        try {
            this.show()
            let res = await this.ready()
            console.log('@res ===> ', res)
            if(res){
                console.log('res有值')
                this.data = { ...this.data, ...res }    
            }
            this.setPromise(initData())
        } catch (e) {
            throw e
        }
    }
    show(){
        console.log('@initData => ', initData)
    }
}

window._my = new My()
window.data = {}

window._my.init()

//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}

async function initData() {
    let res = {}
    $(`[data-my-data]`).each((index, el) => {
        let prop = $(el).data('my-data')
        try {
            let val = $(el).html()
            if (prop === 'blog') {
                res.blog = initBlog(val)
                
            } else {
                res[prop] = JSON.parse(val)
            }
        } catch (e) {
            throw e
        }
    })
    $(`[data-my-data]`).remove()
    console.log('@ initData.js OK ===> ', res)

    return res
    function initBlog(data) {
        let blog = JSON.parse(data)   // 整體轉回obj
        blog.map_imgs = new Map()
        if (blog.imgs.length) {
            blog.imgs.forEach((img, index) => {
                blog.map_imgs.set(img.id, { ...img, index })
            })
        }
        //  將存放在後端「百分比編碼格式的blog.html」解析為一般htmlStr
        blog.html = parseHtml(blog.html)
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
            let reg = /<x-img.+?data-id='(?<id>\w+?)'.+?(data-style='(?<style>.+?)')?.*?\/>/g
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
    }
}
