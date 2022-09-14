
//  下拉選單鈕、通知鈕
let $newsDropdown = $('#newsDropdown')
//  通知比數span
let $newsCount = $('.news-count')
//  下拉選單內 的 readMore鈕
let $readMore = $('#readMore')
//  下拉選單內 的 沒有更多提醒
let $noNews = $('#noNews')

let api_news = '/api/news'
let api_readMore = '/api/news/readMore';


//  初始化數據
(async () => {
    try {
        await init_data()
    } catch (e) {
        console.log(e)
    }
})()

$readMore.on('click', moreNewsForReadMore)

async function moreNewsForReadMore() {
    
    let { num, newsList: newsList_server, excepts } = await getNews()

    let newsList_window = window.data.news.newsList
    //  將已完成的轉移至confirm
    newsList_window.confirm = excepts
    window.data.news.num = num

    render_news({newsList: newsList_server, num, page: window.data.news.page})

    let newsList = initNewsList(newsList_server)

    let map_newsList = new Map(Object.entries(newsList))    //  Map{ confirm: { people: [], blogs: [], comments: [], num: 0 }, unconfirm: {...} }

    map_newsList.forEach((list, key) => {
        let tar_list = newsList_window[key]
        for(prop in list){
            if(prop === 'num'){
                tar_list.num += list.num
                continue
            }
            tar_list[prop] = [...tar_list[prop], ...list[prop]]
        }
    })
    return
}

function show(q, boo = true) {
    return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
}

function render_news({ newsList, num, page }) {
    let count_noRender = num.total - newsList.confirm.length - newsList.unconfirm.length
    let count_unconfirm = num.unconfirm - newsList.unconfirm.length
    show($newsCount, count_unconfirm).text(count_unconfirm || '')

    let map = new Map(Object.entries(newsList))
    map.forEach((list, key) => {
        let $title = $(`#${key}-news-title`)
        if (!list.length) {
            !page && show($title, false)
        }else{
            $title.is(':hidden') && show($title)
        }
        
        let html_list = template_list(list)
        let hr = $(`[data-my-hr=${key}-news-hr]`)
        if (!hr.length) {
            $title.after(html_list)
        } else {
            hr.last().after(html_list)
        }
    })
    readMore(count_noRender)

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
        let {others} = comment
        console.log(comment)
        let nicknames = others.length > 2 ? 
            others.slice(0, 2).join(',') + `與其他${others.length - 2}人，都` : others.length > 0 ?
            others.join(',') + '都' : comment.user.nickname

        return `
    <li class="dropdown-item  position-relative news-item">
        <a href="/blog/${comment.blog.id}#comment_${comment.id}" class="stretched-link">
            <div>
                <span>${nicknames} 在 ${comment.blog.title} 留言囉！</span><br>
                <span>${timestamp}</span>
            </div>
        </a>
    </li>`
    }
    function readMore(count_noRender) {
        let n = count_noRender - window.data.news.limit
        if (n >= 0) {
            $readMore.addClass('my-show').removeClass('my-noshow')
            $noNews.addClass('my-noshow').removeClass('my-show')
        } else {
            $readMore.addClass('my-noshow').removeClass('my-show')
            $noNews.addClass('my-show').removeClass('my-noshow')
        }
    }
}

function initNewsList(newsList) {
    let initNews = { confirm: {}, unconfirm: {} }
    for (key in newsList) {
        initNews[key] = { people: [], blogs: [], comments: [], num: 0 }
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
    return initNews
}

//  初始化數據
async function init_data() {
    window.data = {}

    //  處理 news 以外的數據
    $(`[data-my-data]`).each((index, el) => {
        let $el = $(el)
        let prop = $el.data('my-data')
        try {
            window.data[prop] =  JSON.parse($el.text())
        } catch (e) {
            window.data[prop] = undefined
        }
    })
    $('#data').remove()

    //  處理 news 數據
    let news = await getNews()
    window.data.news = { ...news, page: 0 }
    render_news(window.data.news)
    window.data.news.newsList = initNewsList(news.newsList)
}

async function getNews() {
    let url = `/api/news`
    let method = window.data.news ? 'POST' : 'GET'
    let opts = { method, url }
    console.log('@method => ', method)
    if(method === 'POST'){
        let page = ++window.data.news.page
        opts.data = {
            page,
            excepts: { ...window.data.news.newsList }
        }
    }
    let { data: { errno, data, msg } } = await axios(opts)

    if (errno) {
        alert(msg)
        return
    }
    return data
}