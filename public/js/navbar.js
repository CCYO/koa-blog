async function initNavbar() {
    try {
        // 取得登入者數據
        let data = await getNews()
        console.log('initNavbar => ', data)
        //  初始化通知列表相關功能
        await initNews(data)
        return data
    } catch (e) {
        throw e
    }

    //  初始化 通知列表 功能
    async function initNews(data) {
        //  初始化渲染  ------
        //  渲染基本navBar
        template_nav(data.me)
        //  若未登入，則不需要初始化功能
        if (!data.me) {
            return 
        }

        //  公用變量 ------
        //  下拉選單鈕、通知鈕
        // let $newsDropdown = $('#newsDropdown')
        //  新通知筆數的提醒
        let $newsCount = $('.news-count')
        //  下拉選單內 的 readMore鈕                                                                                                                                                                                                
        let $readMore = $('#readMore')
        //  下拉選單內 的 沒有更多提醒
        let $noNews = $('#noNews')
        /*  取得 news
        data: {
            news : {
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
            },
            me: ...
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
        //  賦予 pageData.news.excepts 預設值
        pageData.news.excepts = { people: [], blogs: [], comments: [], num: 0 }
        //  賦予 pageData.news.page 預設值
        pageData.news.page = 0

        //  渲染並序列化news數據(初次渲染)
        pageData.news = renderAndSerializeNewsData(pageData.news, true)

        //  讀取更多
        $readMore.on('click', moreNews)
        //  登出功能
        $('#logout').click(logout)

        //  handle -----
        //  請求更多通知
        async function moreNews() {
            //  取news
            let { news } = await getNews(pageData.news)
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
            //  使用未序列化的newsData進行渲染
            renderByDeserializeNewsData(news, firstRender)
            //  渲染readMore
            render_readMore(news)
            //  序列化 news 數據
            return serialization_news(news)

            //  序列化 news 數據
            function serialization_news(newsData) {
                let newsList = serialization_newsList(newsData.newsList)
                let res = { ...newsData, newsList }
                let excepts = init_excepts(newsList)
                if (firstRender) {   //  初次渲染
                    res.excepts = excepts
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
                    for (let isConfirm in newsList) {
                        initNews[isConfirm] = { people: [], blogs: [], comments: [], num: 0 }
                        newsList[isConfirm].reduce((init, { type, id }) => {
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
                        }, initNews[isConfirm])
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
                    let { excepts } = pageData.news
                    /*newsList: {
                        unconfirm: { 
                            people: [ id, ... ],
                            blogs: [ id, ... ],
                            comments: [ id, ...],
                            num: NUMBER
                        },
                        confirm: { ... }
                    }*/
                    for (let isConfirm in newsList) {
                        let map = new Map(Object.entries(newsList[isConfirm]))
                        map.forEach((list, type) => {
                            if (type === 'num') {
                                excepts.num += list
                                return
                            }
                            excepts[type] = [...excepts[type], ...list]
                        })
                    }
                    // { people: [id, ...], blogs: [id, ...], comments: [id, ...], num }
                    return excepts
                }
            }
            //  渲染 readMore鈕
            function render_readMore({ num, newsList }) {
                //  前端尚未撈取到的通知數 = 通知總筆數 - 前端目前撈取到的新通知數量
                let count = num.total - pageData.news.excepts.num
                //  count > 0 || 此次撈取的newsData含有新通知
                let more = count > 0 || newsList.unconfirm.length !== 0
                console.log(num.total, '-', pageData.news.excepts.num, '=', count, more)
                show($readMore, more)
                show($noNews, !more)
            }
            //  使用未序列化的newsData進行渲染
            function renderByDeserializeNewsData(news, firstRender) {
                //  num通知總數統計，newsList前端目前撈取到的通知統計
                let { newsList, num } = news
                //  渲染新通知筆數的提醒
                renderUnconfirmNewsCount(newsList, num, firstRender)
                //  渲染通知列表
                renderNewList(newsList)
                return
                //  渲染通知列表
                function renderNewList(newsList) {
                    /*  將DeserializeNewsData.newsList 以
                        key 為 confirm 與 unconfir
                        val 為 newsItem
                        進行 map化
                        Map {
                            'unconfirm' => [ { type, id, timestamp, confirm, fans||blog||comment }, ... ]
                            'confirm' => [...]
                        }
                    */
                    let map = new Map(Object.entries(newsList))
                    //  針對通知列表進行渲染
                    //  list 代表 newsItemList，isConfirm 代表 'unconfirm' | 'confirm'
                    map.forEach((list, isConfirm) => {
                        //  通知列表內的相應title
                        let $title = $(`#${isConfirm}-news-title`)
                        //  判斷newsItemList是否有內容
                        if (!list.length) { //  newsItemList 沒有內容
                            firstRender && show($title, false) //  若初渲染，則隱藏title
                            return
                        }
                        //  newsItemList 有內容
                        //  若title隱藏，則讓其顯示
                        $title.is(':hidden') && show($title)
                        //  生成通知列表內的相應html
                        let htmlStr = template_list(list)
                        //  相應此通知列表的item分隔線
                        let hr = $(`[data-my-hr=${isConfirm}-news-hr]`)
                        if (!hr.length) {   //  無相應的分隔線，代表相應的通知是首次渲染
                            //  渲染在相應title的後方
                            $title.after(htmlStr)
                        } else {    //  有相應的分隔線，代表相應的通知非首次渲染
                            //  渲染在相應通知列的後方
                            hr.last().after(htmlStr)
                        }
                    })
                    //  生成通知列表內的相應html
                    function template_list(newsItemList) {
                        return newsItemList.reduce((init, newsItem) => {
                            let type = newsItem.type
                            if (type === 1) {
                                init += template_fans(newsItem)
                            } else if (type === 2) {
                                init += template_blog(newsItem)
                            } else {
                                init += template_comment(newsItem)
                            }
                            let hr = newsItem.confirm ? `<li data-my-hr="confirm-news-hr">` : `<li data-my-hr="unconfirm-news-hr">`
                            hr += `<hr class="dropdown-divider"></li>`
                            return init += hr
                        }, '')

                        function template_fans({ confirm, id, fans, timestamp }) {
                            let query = confirm ? '' : `?anchorType=1&anchorId=${id}`
                            return `
                <!-- 新通知 of fans -->
                <li class="dropdown-item position-relative news-item">
                    <a href="/other/${fans.id}${query}" class="stretched-link text-wrap ">
                        <div>
                            <span>${fans.nickname}追蹤你囉！</span><br>
                            <p class='text-end mb-0'>${timestamp}</span>
                        </div>
                    </a>
                </li>`
                        }

                        function template_blog({ confirm, id, blog, timestamp }) {
                            let query = confirm ? '' : `?anchorType=2&anchorId=${id}`
                            return `
            <li class="dropdown-item  position-relative news-item">
                <a href="/blog/${blog.id}${query}" class="stretched-link text-wrap">
                    <div>
                        <span>${blog.author.nickname} 有新文章唷！</span><br>
                        <span>- ${blog.title}-</span><br>
                        <p class='text-end mb-0'>${timestamp}</span>
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
                <a href="/blog/${comment.blog.id}${query}#comment_${comment.id}" class="stretched-link text-wrap">
                    <div>
                        <span>${nicknames}在${who}的文章「${comment.blog.title}」留言囉！</span><br>
                        <p class='text-end mb-0'>${timestamp}</span>
                    </div>
                </a>
            </li>`
                        }
                    }
                }
                //  渲染新通知筆數的提醒
                function renderUnconfirmNewsCount(newsList, num, firstRender) {
                    //  計算前端尚未撈取到的新通知筆數
                    let count = firstRender ?
                        //  初次請求news
                        num.unconfirm :
                        //  非初次請求news，通知總數內的新通知總數 - 前端目前撈取到的新通知數量
                        num.unconfirm - newsList.unconfirm.length
                    //  渲染新通知筆數的提醒
                    show($newsCount, count).text(count || '')
                }
            }
        }
        //  生成 navbar template
        function template_nav(me = {}) {
            let user_id = me.id ? me.id : undefined
            let reg_pathname = /^\/(?<pathname>\w+)\/?(?<albumList>list)?/
            let { pathname, albumList } = reg_pathname.exec(location.pathname).groups
            if (user_id) {
                let template_news = `
                    <a class="nav-link dropdown-toggle" href="#" id="newsDropdown"
                        role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">通知
                        <span class="position-absolute translate-middle badge rounded-pill bg-danger news-count"></span>
                    </a>
                    <!-- 通知列表 -->
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown" id="newList">
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
                if (pathname === 'self') {
                    $(`.nav-link[href="/self"]`).addClass('active')
                } else if (pathname === 'setting') {
                    $(`.nav-link[href="/setting"]`).addClass('active')
                } else if (albumList) {
                    $(`.nav-link[href^="/album"]`).addClass('active')
                }
            } else {
                //  未登入
                let template_outOffcanvas = `
                <li class="nav-item">
                    <a class="nav-link nav-tab ${pathname === 'register' ? 'active' : ''}" href="/register" data-my-tab="#register">註冊</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link nav-tab ${pathname === 'login' ? 'active' : ''}" href="/login" data-my-tab="#login">登入</a>
                </li>`
                $('#my-navbar-header-register').html(template_outOffcanvas)
                //  navbar始終展開
                $('.navbar').removeClass('navbar-expand-sm').addClass('navbar-expand')
                //  基本nav始終排後面（未登入狀態僅會有 登入/註冊）
                $('.nav').removeClass('order-0 order-md-0').addClass('order-1')
                //  摺疊nav始終盤排前頭（未登入狀態僅會有Home）
                $('.offcanvas').removeClass('order-1 order-md-1').addClass('order-0')
            }
            //  廣場頁active
            if (pathname === 'square') {
                $(`.nav-link[href="/square"]`).addClass('active')
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
            newsListNeedToConfirm: { num: 0 },
            page: 0,
        }
        if (news) {   //  非初次渲染
            let { newsList: { unconfirm: newsListNeedToConfirm }, page, excepts } = news
            opts = {
                newsListNeedToConfirm,
                page: ++page,
                excepts
            }
        }
        let { data: { errno, data } } = await axios.post(`/api/news`, opts)
        if (!errno) { //  登入狀態，且成功取得數據
            return data
        }
        return { me: {} }
    }
}

export default initNavbar 