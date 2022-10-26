window.data = { me: {} }
//  取得登入使用者的個人資訊
window._myPromiseIns = {}
window._my_promise_all = []
//  初始化數據

        // 取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
        // 如 { html: `<p>56871139</p>`}
        //     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
        //     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}
window._myPromiseIns.initData = async function() {
    $(`[data-my-data]`).each((index, el) => {
        let $el = $(el)
        let prop = $el.data('my-data')
        try {
            window.data[prop] = JSON.parse($el.text())
        } catch (e) {
            window.data[prop] = undefined
        }
    })
    $(`[data-my-data]`).remove()
    console.log('@ window.data[data-my-data] finish')
    console.log('@ initData.js --- ok')
    await Promise.all(window._my_promise_all)
}