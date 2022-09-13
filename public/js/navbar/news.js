
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
    
    let { newsList, excepts } = await getNews()

    //  將已完成的轉移至confirm
    window.data.news.newsList.confirm = excepts

    let m = new Map(Object.entries(newsList.unconfirm))
    m.forEach((item, key) => {
        if (key === 'num') {
            newsList.confirm[key] += newsList.unconfirm[key]
            newsList.unconfirm[key] = 0
            return
        }
        newsList.confirm[key] = [...newsList.confirm[key], ...item]
        newsList.unconfirm[key] = []
    })

    render_news({...newsList, page: window.news.page})

    newsList = initNewsList(newsList)

    let map = new Map(Object.entries(newsList))

    map.forEach((list, key) => {
        let tar = newsList[key]
        for (let prop in tar) {
            if (prop === 'num') {
                tar.num += list.num
                continue
            }
            tar[prop] = [...tar[prop], ...list[prop]]
        }
    })
    return
}

function show(q, boo = true) {
    console.log('@b => ',  boo)
    return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
}

function render_news({ newsList, num, limit, page }) {
    show($newsCount, num.unconfirm).text(num.unconfirm || '')

    let map = new Map(Object.entries(newsList))
    map.forEach((list, key) => {
        let $title = $(`#${key}-news-title`)
        console.log('@page=> ', page)
        console.log('@list.length=> ', list.length)
        console.log('@key => ', key)
        console.log('@title => ', $title)
        if (!list.length) {
            !page && show($title, false) && console.log(123)
        }
        show($title)

        let html_list = template_list(list)
        let hr = $(`[data-my-hr=${key}-news-hr]`)
        if (!hr.length) {
            $title.after(html_list)
        } else {
            hr.last().after(html_list)
        }
    })
    readMore(num.total, limit)

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
    function readMore(total, limit) {
        let n = total - limit
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
    let methods = window.data.news ? 'POST' : 'GET'
    let opts = { methods, url }
    if(methods === 'POST'){
        let page = window.data.news.page++
        opts.body = {
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