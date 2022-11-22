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
            window.val = val
            if (prop === 'blog') {
                let blog = JSON.parse(val)   // 整體轉回obj
                let htmlStr = decodeURI(blog.html)  // html資料做百分比解碼，再轉回obj
                console.log('解碼後的html => ', htmlStr)
                // val.html = val.html === 'null' ? '' : val.html  //  若html資料為無，則檢視為零長度的字段
                if (htmlStr !== 'null') {
                    // let reg = /<x-img data-id='(\w+?)'.+?data-style='(.+?)'\/>/g
                    var reg = /<x-img.+?data-id='(?<id>\w+?)'.+?(data-style='(?<style>.+?)')?.*?\/>/g
                    blog.html = parseHtml(htmlStr)
                    console.log('@blog.html => ', blog.html)
                    function parseHtml(htmlStr) {
                        let _html = htmlStr
                        let res
                        while (res = reg.exec(htmlStr)) {
                            //  imgs : [{ id, alt, img_id, hash, url, blogImg_id, name}, ...]
                            let exist = blog.imgs.find((img) => {
                                let ok = img.id === res[1] * 1
                                return ok
                            })
                            if (exist) {
                                let { url, alt, id } = exist
                                let replaceStr = res.groups.style ? `<img src='${url}?blogImgAlt=${id}' alt='${alt}' style='${res.groups.style}' />` : `<img src='${url}?blogImgAlt=${id}' alt='${alt}' />`
                                _html = _html.replace(res[0], replaceStr)
                                console.log('@_html => ', _html)
                            }
                        }
                        return _html
                    }
                } else {
                    val.html = ''
                }
                val = JSON.stringify(blog)   //  再將整體轉為字符
            }
            window.data[prop] = JSON.parse(val)  // 不用 text() 是因為 /edit/blog/:id 具有 html格式的資料
        } catch (e) {
            throw e
        }
        console.log(`@ window.data.${prop} finish `)
    })
    $(`[data-my-data]`).remove()
    console.log('@ window.data[data-my-data] finish')
    console.log('@ initData.js --- ok')
    await Promise.all(window._my.promiseAll)
}
