console.log('public initData-base - script defer 加載')

window.data = window.data ? window.data : {}

//  初始化數據
init_data()

//  初始化數據
function init_data() {
    //  處理 news 以外的數據
    $(`[data-my-data]`).each((index, el) => {
        let $el = $(el)
        let prop = $el.data('my-data')
        try {
            window.data[prop] = JSON.parse($el.text())
        } catch (e) {
            window.data[prop] = undefined
        }
    })
    $('#data').remove()
}