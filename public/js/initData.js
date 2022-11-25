window._my = {}
window._my.promiseIns = {}
window._my.promiseAll = []
window.data = {}

//  初始化數據
// 取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
// 如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}

window._my.initData = async function () {
    $(`[data-my-data]`).each((index, el) => {
        let prop = $(el).data('my-data')
        try {
            let val = $(el).html()
            if (prop === 'blog') {
                window.data.blog = initBlog(val)
            }else{
                window.data[prop] = JSON.parse(val)
            }
        } catch (e) {
            throw e
        }
        console.log(`@ ejs 放在 DOM 上的 data.${prop} 解析完成`)
    })
    $(`[data-my-data]`).remove()
    console.log('@ initData.js --- ok')
    await Promise.all(window._my.promiseAll)

    function initBlog(data) {
        let blog = JSON.parse(data)   // 整體轉回obj
        if (blog.imgs.length) {
            blog.map_imgs = new Map()
            blog.imgs.forEach(( img, index ) => {
                blog.map_imgs.set(img.id, { ...img, index })
            })
        }
        let htmlStr = decodeURI(blog.html)  // html資料做百分比解碼
        //  將htmlStr內的<x-img>換回<img>
        blog.html = parseHtml(htmlStr)
        return blog //  再將整體轉為字符

        function parseHtml(htmlStr) {
            if (!htmlStr) {
                return ''
            }
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
