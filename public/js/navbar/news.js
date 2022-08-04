console.log('@news')
    //  下拉選單鈕、通知鈕
let $newsDropdown = $('#newsDropdown')
    //  通知比數span
let $newsCount = $('.news-count')
    //  下拉選單內 的 readMore鈕
let $readMore = $('#readMore')
    //  下拉選單內 的 沒有更多提醒
let $noNews = $('#noNews')

let api_news = '/api/news'
let api_readMore = '/api/news/readMore'

//  初始化 newsList數據
init_newsList()

//  手動註冊 BS5 下拉選單
var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
var dropdownList = dropdownElementList.map(function(dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl)
})

//  綁定 下拉選單鈕 的 click handle
$newsDropdown.click(showDropdown)
    //  綁定 readMore鈕 的 click handle
$readMore.click(moreNewsForReadMore)

async function moreNewsForReadMore() {
    let newsList = window.data.newsList
    let { markTime } = newsList
    let listOfNewsId = newsList.listOfNewsId
    let payload = { markTime, listOfNewsId: listOfNewsId.confirm }

    let { data: { errno, data, msg } } = await axios.post(api_readMore, payload)
    if (errno) {
        alert('發生錯誤')
        console.log('@msg => ', msg)
        return
    }

    /*
     * numOfUnconfirm - 晚於 markTime 的 unconfirmNews 總數
     * total - userId 的通知總數
     * count - 此次 response 的 通知數量
     * htmlStr - { confirm: string, unconfirm: string } html字符格式的通知數據
     * ListOfNewsId - 此次 response 包含的 newsList 之 id 列表
     */
    let { numOfUnconfirm, total, count, htmlStr, listOfNewsId: { people, blogs, comments } } = data

    //  若 numOfUnconfirm 有值，則
    if (numOfUnconfirm > 0) {
        //  通知鈕顯示筆數
        $newsCount.toggle(true).text(numOfUnconfirm)
            //  window.newsList.numOfUnconfirm 更新
        newsList.numOfUnconfirm = numOfUnconfirm
    } else {
        newsList.numOfUnconfirm = 0
    }

    //  window.newsList.count 更新
    newsList.count += count
        //  window.newsList.confirm 更新
    let confirm = listOfNewsId.confirm
    confirm.people = [...confirm.people, ...people]
    confirm.blogs = [...confirm.blogs, ...blogs]
    confirm.comments = [...confirm.comments, ...comments]

    //  根據 response 添加通知內容
    for (prop in htmlStr) {
        let html = htmlStr[prop]
        if (!html) {
            continue
        }
        let $hrs = $(`[data-my-hr='${prop}-news-hr']`)
        $hrs.length && $hrs.last().after(html) || $(`#${prop}-news-title`).toggle(true).after(html)
    }

    let more = newsList.total - newsList.count > 0
        //  判斷下拉選單內的 readMore鈕 是否該顯示
    $readMore.toggle(more) && $noNews.toggle(!more)
}

async function moreNewsForDropdown() {
    let newsList = window.data.newsList
    let markTime = (new Date()).toISOString()
    let payload = { markTime }

    //  ajax 取得通知數據
    let { data: { errno, data, msg } } = await axios.post(api_readMore, payload)

    if (errno) {
        alert('發生錯誤')
        console.log('@msg => ', msg)
        return
    }

    /*
     * numOfUnconfirm - 晚於 markTime 的 unconfirmNews 總數
     * total - userId 的通知總數
     * count - 此次 response 的 通知數量
     * htmlStr - { confirm: string, unconfirm: string } html字符格式的通知數據
     * ListOfConfirmNewsId - 此次 response 包含的 newsList 之 id 列表
     */
    let { numOfUnconfirm, total, count, htmlStr, listOfNewsId: { people, blogs, comments } } = data

    //  若 numOfUnconfirm 有值，則
    if (numOfUnconfirm > 0) {
        //  通知鈕顯示筆數
        $newsCount.toggle(true).text(numOfUnconfirm)
            //  window.newsList.numOfUnconfirm 更新
        newsList.numOfUnconfirm = numOfUnconfirm
    } else {
        newsList.numOfUnconfirm = 0
    }


    //  window.newsList.total 更新
    newsList.total = total
        //  window.newsList.count 更新
    newsList.count = count
        //  window.newsList.listOfConfirmNewsId 更新
    newsList.listOfNewsId.confirm = { people, blogs, comments }

    //  window.newsList.markTime 更新
    newsList.markTime = markTime

    //  移除現有通知列成員
    $(`.news-item`).remove()
    $(`[data-my-hr]`).remove()
        //  根據 response 添加通知內容
    for (prop in htmlStr) {
        let html = htmlStr[prop]
        if (!html) {
            continue
        }
        let $title = $(`#${prop}-news-title`)
        $title.toggle(true).after(html)
    }

    let more = newsList.total - newsList.count > 0
        //  判斷下拉選單內的 readMore鈕 是否該顯示
    $readMore.toggle(more) && $noNews.toggle(!more)

    //  顯示 BS5 下拉選單
    bootstrap.Dropdown.getInstance($newsDropdown[0]).show()
}

//  confirm 當前下拉選單內的 unconfirmNews
async function confirmNews() {
    let newsList = window.data.newsList
    let listOfNewsId = newsList.listOfNewsId
    let { data: { errno, data, msg } } = await axios.patch(api_news, { listOfNewsId: listOfNewsId.unconfirm })
    if (errno) {
        alert('confirm失敗')
        console.log('@msg => ', msg)
    }
    //  完成 confirm 的通知數據
    let { listOfNewsId: { people, blogs, comments }, count } = data
    //  更新 data.newsList.listOfNewsId.unconfirm
    listOfNewsId.unconfirm = undefined
        //  更新 data.newsList.listOfNewsId.confirm
    let confirm = newsList.listOfNewsId.confirm
    confirm.people = [...confirm.people, ...people]
    confirm.blogs = [...confirm.blogs, ...blogs]
    confirm.comments = [...confirm.comments, ...comments]
}
//  handle 顯示下拉選單
async function showDropdown() {
    //  隱藏通知筆數
    $newsCount.toggle(false)

    let newsList = window.data.newsList
    let { listOfNewsId, numOfUnconfirm, total, count } = newsList
    if (listOfNewsId.unconfirm) {
        //  進到這邊，代表下拉選單列表內有unconfirmNews，且目前是頁面第一次點擊下拉選單鈕
        await confirmNews()
        newsList.numOfUnconfirm = 0
    } else if (numOfUnconfirm) {
        //  非初次點擊下拉選單紐，且後端有 晚於 window.data.newsList.markTime 的 unconfirmNews
        await moreNewsForDropdown()
    }

    return
}

function init_newsList() {
    let news = window.data.newsList
    if (!news.limit) {
        return
    }
    let { newsList: { confirm, unconfirm }, total, markTime, limit } = news
    window.data._newsList = { limit, total, markTime, count: confirm.length + unconfirm.length }

    let _newsList = window.data._newsList

    if (!_newsList.count) {
        _newsList.listOfNewsId = { confirm: { people: [], blogs: [] }, unconfirm: undefined }
        window.data.newsList = {..._newsList }
        delete window.data._newsList
        return
    }

    _newsList.listOfNewsId = {
        unconfirm: unconfirm.length && _init_news(unconfirm) || undefined,
        confirm: confirm.length && _init_news(confirm) || { people: [], blogs: [], comments: [] }
    }

    window.data.newsList = {..._newsList }
    delete window.data._newsList
    return
}


function _init_news(newsList) {
    let res = { people: [], blogs: [], comments: [] }
    if (!newsList.length) {
        return res
    }
    return newsList.reduce((initVal, { type, id }) => {
        type === 1 && initVal.people.push(id)
        type === 2 && initVal.blogs.push(id)
        type === 3 && initVal.comments.push(id)
        return initVal
    }, res)
}