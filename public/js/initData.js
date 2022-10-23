window.data = { me: {} }
//  取得登入使用者的個人資訊
window._myPromiseIns = {}
window._my_promise_all = []
//  初始化數據
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