async function initNavbar() {
    try {
        // 取得登入者數據
        let data = await getNews()
        // if (data.me.id) { //  登入狀態
        //  初始化通知列表相關功能
        await initNews(data)
        // }
        return data
    } catch (e) {
        throw e
    }

    //  初始化 通知列表 功能
    async function initNews(data) {
        //  初始化渲染  ------
        //  渲染基本navBar
        // $('#my-navbar-header-register').html(template_nav(data.me.id))
        template_nav(data.me.id)
        //  若未登入，則不需要初始化功能
        if (!data.me.id) {
            return
        }

        //  公用變量 ------
        /*  取得 news
        data: {
            newsList: {
                unconfirm: [
                    { type, id, timestamp, confirm, fans: ... },
                    { type, id, timestamp, confirm, blog: ... },
                    { type, id, timestamp, confirm, comment: ... },
                ... ],
                confirm: [...]
            },
            num: { unconfirm, confirm, total },
            limit
        }
        ↓ initNews 之後
        data: {
            initNews: { 
                confirm: { people: [id...], blogs: [id...], comments: [id...], num: 0 },
                unconfirm: { people: [id...], blogs: [id...], comments: [id...], num: 0 }
            },
            excepts: { people: [id...], blogs: [id...], comments: [id...], num: 0 },
            num: { unconfirm, confirm, total },
            limit
        }
        */
        let pageData = data
        //  下拉選單鈕、通知鈕
        let $newsDropdown = $('#newsDropdown')
        //  通知比數span
        let $newsCount = $('.news-count')
        //  下拉選單內 的 readMore鈕                                                                                                                                                                                                
        let $readMore = $('#readMore')
        //  下拉選單內 的 沒有更多提醒
        let $noNews = $('#noNews')

        pageData.news = renderAndSerializeNewsData(pageData.news, true)

        //  更新unconfirm通知數目
        $newsDropdown.one('click', unconfirmNewsCount)
        //  讀取更多
        $readMore.on('click', moreNewsForReadMore)
        //  登出功能
        $('#logout').click(logout)

        //  handle -----
        //  新通知數量
        function unconfirmNewsCount() {
            let { num, newsList } = pageData.news
            let count = num.unconfirm - newsList.unconfirm.num
            show($newsCount, count).text(count || '')
        }
        //  更多通知
        async function moreNewsForReadMore() {
            //  取news
            let news = await getNews(pageData.news)
            pageData.news = renderAndSerializeNewsData(news)
            return
        }

        //  功能 -----
        //  登出
        async function logout(e) {
            let ready = confirm('真的要登出?')
            if (!ready) {
                alert('對嘛，再待一下嘛')
                return
            }
            let { data: {
                errno, data, msg
            } } = await axios.get('/api/user/logout')
            alert(data || msg)
            if (!errno) {
                location.href = '/login'
            }
        }
        //  渲染 + 序列化 news
        function renderAndSerializeNewsData(news, firstRender = false) {
            //  初次渲染news
            render_news(news, firstRender)
            //  渲染readMore
            render_readMore(news)
            //  序列化 news 數據
            return serialization_news(news)

            //  序列化 news 數據
            function serialization_news(newsData) {
                let { newsList } = newsData
                newsList = serialization_newsList(newsList)
                let res = { ...newsData, newsList }
                let excepts = init_excepts(newsList)
                if (!pageData.news.excepts) {   //  初次渲染
                    res.excepts = excepts
                    res.page = 0
                } else {  //  非初次渲染
                    // { people: [id, ...], blogs: [id, ...], comments: [id, ...], num }
                    for (let key in pageData.news.excepts) {
                        if (key === 'num') {
                            excepts.num += pageData.news.excepts.num
                            break
                        }
                        excepts[key] = [...pageData.news.excepts[key], ...excepts[key]]
                    }
                    res.excepts = excepts
                    res.page = ++pageData.news.page
                }
                return res

                //  格式化通知數據
                function serialization_newsList(newsList) {
                    let initNews = { confirm: {}, unconfirm: {} }
                    for (let key in newsList) {
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
                    /* newsList: {
                        unconfirm: { 
                            people: [ id, ... ],
                            blogs: [ id, ... ],
                            comments: [ id, ...],
                            num: 0
                        },
                        confirm: { ... }
                    }*/
                    return initNews
                }
                //  格式化要撇除的news（提供給後端使用）
                function init_excepts(newsList) {
                    let res = { people: [], blogs: [], comments: [], num: 0 }
                    /*newsList: {
                        unconfirm: { 
                            people: [ id, ... ],
                            blogs: [ id, ... ],
                            comments: [ id, ...],
                            num: NUMBER
                        },
                        confirm: { ... }
                    }*/
                    for (let prop in newsList) {
                        let map = new Map(Object.entries(newsList[prop]))
                        map.forEach((list, k) => {
                            if (k === 'num') {
                                res.num += list
                                return
                            }
                            res[k] = [...res[k], ...list]
                        })
                    }
                    // { people: [id, ...], blogs: [id, ...], comments: [id, ...], num }
                    return res
                }
            }
            //  渲染 readMore鈕
            function render_readMore({ num, newsList }) {
                let excepts = pageData.news.excepts && pageData.news.excepts.num || 0
                //  DB_news_num - 此次響應unconfirm - 此次響應confirm
                let count = num.total - excepts
                let more = count !== 0 || newsList.unconfirm.length !== 0
                show($readMore, more)
                show($noNews, !more)
            }
            //  渲染通知數據
            function render_news(news, firstRender) {
                let { newsList, num } = news
                //  渲染新通知數目
                if (firstRender) {    //初次渲染
                    let x = show($newsCount, num.unconfirm).text(num.unconfirm || '')
                } else {  //readMore觸發的渲染
                    //  DB_unconfirm - 此次 newsList_unconfirm
                    let count = num.unconfirm - newsList.unconfirm.length
                    show($newsCount, count).text(count || '')
                }

                //  渲染通知列表
                /*
                Map {
                        'unconfirm' => [ { type, id, timestamp, confirm, fans||blog||comment }, ... ]
                        'confirm' => [...]
                }*/
                let map = new Map(Object.entries(newsList))
                //  list 代表 unconfirmList | confirmList，key 代表 'unconfirm' | 'confirm'
                map.forEach((list, key) => {
                    //  通知列表中，對應的title
                    let $title = $(`#${key}-news-title`)
                    if (!list.length) { //  list 沒有內容
                        firstRender && show($title, false) //  初渲染，則隱藏title
                    } else {    //  若 list 有內容
                        $title.is(':hidden') && show($title)    //  非初次渲染，若title隱藏，則讓其顯示
                    }
                    //  生成 list 的 html
                    let html_list = template_list(list)
                    //  對應此通知分纇的item分隔線
                    let hr = $(`[data-my-hr=${key}-news-hr]`)
                    if (!hr.length) {   //  無分隔線，代表此纇list為首次渲染
                        //  渲染在title後方
                        $title.after(html_list)
                    } else {    //  有分隔線，代表此纇list非首次渲染
                        //  在最後一個此纇通知的後方加入item
                        hr.last().after(html_list)
                    }
                })

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

                    function template_fans({ confirm, id, fans, timestamp }) {
                        let query = confirm ? '' : `?anchorType=1&anchorId=${id}`
                        return `
                <!-- 新通知 of fans -->
                <li class="dropdown-item position-relative news-item">
                    <a href="/other/${fans.id}${query}" class="stretched-link">
                        <div>
                            <span>${fans.nickname}追蹤你囉！</span><br>
                            <span>${timestamp}</span>
                        </div>
                    </a>
                </li>`
                    }

                    function template_blog({ confirm, id, blog, timestamp }) {
                        let query = confirm ? '' : `?anchorType=2&anchorId=${id}`
                        return `
            <li class="dropdown-item  position-relative news-item">
                <a href="/blog/${blog.id}${query}" class="stretched-link">
                    <div>
                        <span>${blog.author.nickname} 有新文章唷！</span><br>
                        <span>- ${blog.title}-</span><br>
                        <span>${timestamp}</span>
                    </div>
                </a>
            </li>
            `
                    }

                    function template_comment({ confirm, id, comment, timestamp }) {
                        let { others } = comment
                        let otherNotIncludeMe = []
                        if (others.length) {
                            otherNotIncludeMe = new Set()
                            others.reduce((initVal, other) => {
                                if (other.user.id !== pageData.me.id) {
                                    otherNotIncludeMe.add(other.user.nickname)
                                }
                                return initVal
                            }, otherNotIncludeMe)
                            otherNotIncludeMe = [...otherNotIncludeMe]
                        }
                        let count = otherNotIncludeMe.length
                        let nicknames =
                            count > 1 ? otherNotIncludeMe.slice(0, 2).join(',') + `${count > 2 ? `與其他${count - 2}人` : ''}` + `，都` :
                                count > 0 ? otherNotIncludeMe.join(',') :
                                    comment.user.nickname

                        let who =
                            count > 1 && comment.blog.author.id === pageData.me.id ? '你' :
                                comment.blog.author.id === comment.user.id ? '自己' : comment.blog.author.nickname
                        let query = confirm ? '' : `?anchorType=3&anchorId=${id}`
                        return `
            <li class="dropdown-item  position-relative news-item">
                <a href="/blog/${comment.blog.id}${query}#comment_${comment.id}" class="stretched-link">
                    <div>
                        <span>${nicknames}在${who}的文章「${comment.blog.title}」留言囉！</span><br>
                        <span>${timestamp}</span>
                    </div>
                </a>
            </li>`
                    }
                }
            }
        }
        //  生成 navbar template
        function template_nav(user_id) {
            let reg_pathname = /^\/(?<pathname>\w+)\/?(?<albumList>list)?/
            let { pathname, albumList } = reg_pathname.exec(location.pathname).groups
            if (user_id) {
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
                let template_inOffcanvas = `
                <ul class="navbar-nav justify-content-around pe-3">
                    <li class="nav-item">
                        <a class="nav-link me-3" href="/self">個人頁面</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link me-3" href="/album/list/${user_id}">文章相簿</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link me-3" href="/setting">個人設置</a>
                    </li>
                    <li class="nav-item">
                        <a id="logout" class="btn btn-outline-success text-nowrap">登出</a>
                    </li>
                </ul>
                `
                let template_outOffcanvas = `
                <li class="nav-item dropdown">
                        ${template_news}
                </li>
                `
                $('#my-navbar-header-register').html(template_outOffcanvas)
                $('.offcanvas-body').html(template_inOffcanvas)
                console.log('@ => ', pathname, albumList)
                if(pathname === 'self'){
                    $(`.nav-link[href="/self"]`).addClass('active')
                }else if(pathname === 'setting'){
                    $(`.nav-link[href="/setting"]`).addClass('active')
                }else if(albumList){
                    $(`.nav-link[href^="/album"]`).addClass('active')
                }
            } else {               
                let template_outOffcanvas = `
                <li class="nav-item">
                    <a class="nav-link nav-tab ${pathname === 'register' ? 'active' : ''}" href="/register" data-my-tab="#register">註冊</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link nav-tab ${pathname === 'login' ? 'active' : ''}" href="/login" data-my-tab="#login">登入</a>
                </li>`
                $('#my-navbar-header-register').html(template_outOffcanvas)
            }
        }

        //  utils ------
        //  顯示el與否
        function show(q, boo = true) {
            return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
        }
    }

    //  請求 news
    async function getNews(news) {
        let opts = {
            newsList: { num: 0 },
            page: 0,
        }
        if (news) {   //  非初次渲染
            let { newsList: { unconfirm: newsList }, page, excepts } = news
            opts = {
                ...opts,
                newsList,
                page: ++page,
                excepts
            }
        }
        let { data: { errno, data, msg } } = await axios.post(`/api/news`, opts)
        if (!errno) { //  登入狀態，且成功取得數據
            return data
        }
        return { me: {} }
    }
}

export default initNavbar 