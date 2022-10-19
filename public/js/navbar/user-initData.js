{/* <script defer src="/js/navbar/news.js"></script>
<script defer src="/js/navbar/logout.js"></script> */}

console.log('public initData-base - script defer 加載')

window.data = window.data ? window.data : {}
console.log('@1')

window.p = getMe()
//  初始化數據
init_data()

//  初始化數據
async function init_data() {
    console.log('@1 init')
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
    $(`[data-my-data]`).remove()
    // let me = window.data.me = await window.p
    //  await getMe()
    await window.p
    await render_nav(window.data.me.id)
}

async function render_nav(user_id) {
    let template = template_nav(user_id)
    $('#my-navbar-header-register').html(template)
    if (!user_id) {
        return
    }
    await initNews()
}

function template_nav(user_id) {
    let template_news = `
        <a class="nav-link dropdown-toggle" href="#" id="newsDropdown"
            role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">通知
            <span class="position-absolute translate-middle badge rounded-pill bg-danger news-count"></span>
        </a>
        <!-- 通知列表 -->
        <ul class="dropdown-menu" aria-labelledby="navbarDropdown" id="newList">
            <!-- 新通知標題 -->
            <li class="dropdown-item" id="unconfirm-news-title">新通知</li>
            <!-- 先前通知的標頭 -->
            <li class="dropdown-item" id="confirm-news-title">先前的通知</li>
            <li id="readMore">
                <button class="dropdown-item link-primary" type="button">讀取更多</button>
            </li>
            <li class="dropdown-item" id="noNews">
                <span>沒有更多了</span>
            </li>
        </ul>
    `
    let template_noLogin = `
        <li class="nav-item">
            <a class="nav-link nav-tab" href="/register" data-my-tab="#register">註冊</a>
        </li>
        <li class="nav-item">
            <a class="nav-link nav-tab" href="/login" data-my-tab="#login">登入</a>
        </li>
    `
    let template_login = `
        <li class="nav-item">
            <a class="nav-link me-3" href="/self">個人頁面</a>
        </li>
         <li class="nav-item dropdown">
            ${template_news}
        </li> 
        <li class="nav-item">
            <a class="nav-link me-3" href="/setting">個人設置</a>
        </li>
        <li class="nav-item">
            <a id="logout" class="btn btn-outline-success text-nowrap" href="/api/user/logout">登出</a>
        </li>
    `
    let template = user_id ? template_login : template_noLogin
    return template
}

async function getMe() {
    let api = '/api/user'
    let { data: { errno, data, msg } } = await axios.get(api)
    if (errno) {
        data = {}
    }
    window.data.me = data
    console.log('@getMe => ', window.data.me)
    return errno
}


async function initNews() {
    //  下拉選單鈕、通知鈕
    let $newsDropdown = $('#newsDropdown')
    //  通知比數span
    let $newsCount = $('.news-count')
    //  下拉選單內 的 readMore鈕
    let $readMore = $('#readMore')
    //  下拉選單內 的 沒有更多提醒
    let $noNews = $('#noNews')

    let api_news = '/api/news';

    //  初始化數據
    (async () => {
        console.log('public news init調用')
        try {
            //  處理 news 數據
            let data = await getNews()
            let { me, ...news } = data
            render_news(news)

            window.data.me = me
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
        w_newsList.confirm = excepts ? excepts : { people: [], blogs: [], comments: [], num: 0 }
        w_newsList.unconfirm = { people: [], blogs: [], comments: [], num: 0 }
        window.data.news.num = num

        newsList = initNewsList(newsList)

        console.log('@newsList => ', newsList)
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
            let { id: me } = window.data.me
            let otherNotIncludeMe = []
            if (others.length) {
                otherNotIncludeMe = new Set()
                others.reduce((initVal, other) => {
                    console.log('抓之前', other, other.user.id, me)
                    if (other.user.id !== me) {
                        console.log('抓 => ', other.user.id, other.user.nickname)
                        otherNotIncludeMe.add(other.user.nickname)
                    }
                    return initVal
                }, otherNotIncludeMe)
                otherNotIncludeMe = [...otherNotIncludeMe]
            }
            console.log('@otherNotIncludeMe => ', otherNotIncludeMe)
            let count = otherNotIncludeMe.length
            let nicknames =
                count > 1 ? otherNotIncludeMe.slice(0, 2).join(',') + `${count > 2 ? `與其他${count - 2}人` : ''}` + `，都` :
                    count > 0 ? otherNotIncludeMe.join(',') :
                        comment.user.nickname
            console.log('@nicknames => ', nicknames)
            let who =
                count > 1 && comment.blog.author.id === me ? '你' :
                    comment.blog.author.id === comment.user.id ? '自己' : comment.blog.author.nickname
            console.log('@comment.blog.author.nickname => ', comment.blog.author.nickname)
            console.log('@otherNotIncludeMe[0] => ', otherNotIncludeMe[0])
            console.log('@who => ', who)
            return `
    <li class="dropdown-item  position-relative news-item">
        <a href="/blog/${comment.blog.id}#comment_${comment.id}" class="stretched-link">
            <div>
                <span>${nicknames}在${who}的文章「${comment.blog.title}」留言囉！</span><br>
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
    //  初始化數據
    async function init_data() {
        //  處理 news 數據
        let news = await getNews()
        render_news(news)

        window.data.news = { ...news, page: 0 }
        window.data.news.newsList = initNewsList(news.newsList)
    }
    //  撈取通知數據
    async function getNews() {
        let url = `/api/news`
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
}