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
        let $el = $(el)
        let prop = $el.data('my-data')
        try {
            window.data[prop] = JSON.parse($el.html())  // 不用 text() 是因為 /edit/blog/:id 具有 html格式的資料
        } catch (e) {
            window.data[prop] = undefined
        }
        console.log(`@ window.data.${prop} finish `)
    })
    $(`[data-my-data]`).remove()
    console.log('@ window.data[data-my-data] finish')
    console.log('@ initData.js --- ok')
    await Promise.all(window._my.promiseAll)
}
