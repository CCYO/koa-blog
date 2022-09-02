
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

window.data = {}
//  初始化數據
init_data()

//  手動註冊 BS5 下拉選單
// var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
// var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
//     return new bootstrap.Dropdown(dropdownToggleEl)
// })

//  綁定 下拉選單鈕 的 click handle
// $newsDropdown.click(showDropdown)
//  綁定 readMore鈕 的 click handle
$readMore.on('click', moreNewsForReadMore)

async function moreNewsForReadMore() {
    let { newsList, page } = window.data.news
    
    let payload = { excepts: newsList, page: page + 1}
    
    let { data: { errno, data, msg } } = await axios.post(api_news, payload)
    if (errno) {
        alert('發生錯誤')
        console.log('@msg => ', msg)
        return
    }
    
    

    return

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

    let newsList = window.data.news.newsList
    let { num, limit } = window.data.news

    let payload = { excepts: newsList.unconfirm, page: window.data.news.page }

    let api = `/api/news`

    let { data: { errno, data, msg } } = await axios.post(api, payload)

    console.log(data)
    // if (listOfNewsId.unconfirm) {
    //     //  進到這邊，代表下拉選單列表內有unconfirmNews，且目前是頁面第一次點擊下拉選單鈕
    //     await confirmNews()
    //     newsList.numOfUnconfirm = 0
    // } else if (numOfUnconfirm) {
    //     //  非初次點擊下拉選單紐，且後端有 晚於 window.data.newsList.markTime 的 unconfirmNews
    //     await moreNewsForDropdown()
    // }

    // return
}

//  初始化數據
function init_data() {
    $(`[data-my-data]`).each((index, el) => {
        let $el = $(el)
        let prop = $el.data('my-data')
        try {
            window.data[prop] = JSON.parse($el.text())
        } catch (e) {
            window.data[prop] = undefined
        }
    })
    //  初始化 newsList數據
    // _init_newsList()
    $('#data').remove()
}

function _init_newsList() {
    let news = window.data.newsList
    if (!news.limit) {
        return
    }
    let { newsList: { confirm, unconfirm }, total, markTime, limit } = news
    window.data._newsList = { limit, total, markTime, count: confirm.length + unconfirm.length }

    let _newsList = window.data._newsList

    if (!_newsList.count) {
        _newsList.listOfNewsId = { confirm: { people: [], blogs: [] }, unconfirm: undefined }
        window.data.newsList = { ..._newsList }
        delete window.data._newsList
        return
    }

    _newsList.listOfNewsId = {
        unconfirm: unconfirm.length && _init_news(unconfirm) || undefined,
        confirm: confirm.length && _init_news(confirm) || { people: [], blogs: [], comments: [] }
    }

    window.data.newsList = { ..._newsList }
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

go()

function show(q, boo = true){
    return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
}

let $newsCount = $('.news-count')
let $title_unconfirm = $('#unconfirm-news-title')

async function go() {
    await getNews()
    initNewsList()
    async function getNews() {
        let api = '/api/news'
        let { data: { errno, data, msg } } = await axios(api)
        
        let $menu = $('.dropdown-menu')
        
        let $title_confirm = $('#confirm-news-title')
        
        window.data = window.data ? window.data : {}
        window.data.news = { ...data, page: 0 }
        render_news(data)
    }

    function render_news({ newsList, num, limit }, first = false) {
        let { unconfirm, confirm } = newsList
        let list_unconfirm
        let list_confirm
        show($newsCount, num.unconfirm).text(num.unconfirm || '')
        
        let map = new Map(Object.entries(newsList))
        map.forEach((list, key) => {
            let $title = $(`#${key}-news-title`)
            if(list.length){
                first && show($title, unconfirm.length) || $title.addClass('my-show')
                
            }
        })
        if(unconfirm.length){
            
            list_unconfirm = template_list(newsList.unconfirm)
            let hr = $(`#${key}-news-title`)
        }
        if (unconfirm.length) {
            $title_unconfirm.toggleClass
            
            // list_unconfirm += template_footer(false)
            $('#unconfirm-news-title').after(list_unconfirm)
        } else {
            list_unconfirm = ''
            $('#unconfirm-news-title').addClass('my-noshow')
        }

        if (confirm.length) {
            list_confirm = template_list(newsList.confirm)
            // list_confirm += template_footer(true)
            $('#confirm-news-title').after(list_confirm)
        } else {
            let list_confirm = ''
            $('#confirm-news-title').addClass('my-noshow')
        }

        readMore(num.total, limit)
    }
    function template_list(list) {
        return list.reduce((init, cur) => {
            let type = cur.type
            if (type === 1) {
                init += template_fans(cur)
            } else if (type === 2) {
                init += template_blog(cur)
            } else {
                init += template_comment(cur)
            }
            let hr = cur.confirm ? `<li data-my-hr="confirm-news-hr">` : `<li data-my-hr="unconfirm-news-hr">`
            hr += `<hr class="dropdown-divider"></li>`
            return init += hr
        }, '')
    }
    function template_fans({ fans, timestamp }) {
        return `
    <!-- 新通知 of fans -->
    <li class="dropdown-item position-relative news-item">
        <a href="/other/${fans.id}" class="stretched-link">
            <div>
                <span>${fans.nickname}追蹤你囉！</span><br>
                <span>${timestamp}</span>
            </div>
        </a>
    </li>`

    }
    function template_blog({ blog, timestamp }) {
        return `
    <li class="dropdown-item  position-relative news-item">
        <a href="/blog/${blog.id}" class="stretched-link">
            <div>
                <span>${blog.author.nickname} 有新文章唷！</span><br>
                <span>- ${blog.title}-</span><br>
                <span>${timestamp}</span>
            </div>
        </a>
    </li>
    `
    }
    function template_comment({ comment, timestamp }) {
        return `
    <li class="dropdown-item  position-relative news-item">
        <a href="/blog/${comment.blog.id}#comment_${comment.id}" class="stretched-link">
            <div>
                <span>${comment.user.nickname} 在 ${comment.blog.title} 留言囉！</span><br>
                <span>${timestamp}</span>
            </div>
        </a>
    </li>`
    }
    
    function readMore(total, limit) {
        let n = total - limit
        if(n >= 0){
            $readMore.addClass('my-show').removeClass('my-noshow') 
            $noNews.addClass('my-noshow').removeClass('my-show') 
        }else{
            $readMore.addClass('my-noshow').removeClass('my-show') 
            $noNews.addClass('my-show').removeClass('my-noshow') 
        }
    }
}

function initNewsList() {
    let { newsList } = window.data.news
    let initNews = { confirm: { }, unconfirm: {}}
    for(key in newsList){
        initNews[key] = { people: [], blogs: [], comments: [] , num: 0}
        newsList[key].reduce((init, { type, id }) => {
            switch (type) {
                case 1:
                    init['people'].push(id)
                    break;
                case 2:
                    init['blogs'].push(id)
                    break;
                case 3:
                    init['comments'].push(id)
                    break;
            }
            init.num++
            return init
        }, initNews[key])
    }
    window.data.news.newsList = initNews
}
