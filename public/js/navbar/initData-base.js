window.data = window.data ? window.data : {}
//  初始化數據
init_data()

//  初始化數據
function init_data() {
    $(`[data-my-data]`).each((index, el) => {
        let $el = $(el)
        let prop = $el.data('my-data')
        try {
            window.data[prop] = JSON.parse($el.text())
            console.log('@@@', prop)
        } catch (e) {
            window.data[prop] = undefined
        }
    })
    $('#data').remove()
}