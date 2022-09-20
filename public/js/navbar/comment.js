console.log('public comment')

let url = '/api/comment';

//  初始化news數據
(async () => {
    try {
    //  處理 news 數據
    let news = await getComment()
    render_news(news)

    window.data.news = { ...news, page: 0 }
    window.data.news.newsList = initNewsList(news.newsList)

    } catch (e) {
        console.log(e)
    }
})()
//  更新unconfirm通知數目
$newsDropdown.one('click', () => {
    let { num, newsList } = window.data.news
    let count = num.unconfirm - newsList.unconfirm.num
    show($newsCount, count).text(count || '')
})
$readMore.on('click', moreNewsForReadMore)
//  handle - 讀取更多通知數據
async function moreNewsForReadMore() {
    //  撈數據
    let news = await getNews()
    let { num, newsList, excepts } = news

    //  渲染通知數據
    render_news(news)

    //  更新當前頁面數據
    let w_newsList = window.data.news.newsList
    w_newsList.confirm = excepts
    w_newsList.unconfirm = { people: [], blogs: [], comments: [], num: 0 }
    window.data.news.num = num

    newsList = initNewsList(newsList)

    let map = new Map(Object.entries(newsList))    //  Map{ confirm: { people: [], blogs: [], comments: [], num: 0 }, unconfirm: {...} }

    map.forEach((list, key) => {
        let targetList = w_newsList[key]
        for (prop in list) {
            if (prop === 'num') {
                targetList.num += list.num
                continue
            }
            targetList[prop] = [...targetList[prop], ...list[prop]]
        }
    })
    return
}
//  utils - 顯示el與否
function show(q, boo = true) {
    return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
}
//  渲染通知數據
function render_news(news) {
    let { newsList, num, excepts } = news
    //  初渲染
    let first_render = !window.data.news

    //  渲染新通知數目
    if (first_render) {    //初次渲染
        show($newsCount, num.unconfirm).text(num.unconfirm || '')
    } else {  //readMore後的渲染
        let count = num.unconfirm - newsList.unconfirm.length
        show($newsCount, count).text(count || '')
    }

    //  渲染通知列表
    let map = new Map(Object.entries(newsList))
    map.forEach((list, key) => {
        //  通知的title
        let $title = $(`#${key}-news-title`)
        if (!list.length) { //  若 list 沒有內容
            first_render && show($title, false) //  若是初渲染，則將該纇通知title隱藏
        } else {    //若 list 有內容
            $title.is(':hidden') && show($title)    //若該纇標題title隱藏，則顯現
        }
        //  生成 list 的 html
        let html_list = template_list(list)
        //  此通知類型的item分隔線
        let hr = $(`[data-my-hr=${key}-news-hr]`)

        if (!hr.length) {   //  若無分隔線，代表此纇list為首次渲染
            $title.after(html_list)
        } else {    //  若有分隔線，代表此纇list非首次渲染
            hr.last().after(html_list)
        }
    })

    //  渲染readMore
    render_readMore(news)


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
        let { others } = comment
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

    function render_readMore({ num, newsList, excepts }) {
        let count = num.total - newsList.unconfirm.length - newsList.confirm.length
        if (excepts) {
            count -= excepts.num
        }
        console.log(`@還有${count}個通知可撈取`)
        let more = !(!count && !newsList.unconfirm.length)
        show($readMore, more)
        show($noNews, !more)
    }
}
//  格式化通知數據
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

//  撈取通知數據
async function getComment() {
    let method = window.data.news ? 'POST' : 'GET'
    let opts = { method, url }
    if (method === 'POST') {
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