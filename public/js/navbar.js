async function initNavbar() {
    try {
        // 取得「新聞」數據（含登入者資訊）
        let data = await getNews()
        //  初始化通知列表相關功能
        await initNews(data)
        let { news, me } = data
        return { me }
    } catch (e) {
        throw e
    }

    //  初始化 通知列表 功能
    async function initNews(data) {
        //  初始化渲染  ------
        let user_id = me.id
        let isLogin = !!user_id
        //  渲染 NavBar
        if (isLogin) {
            templateForLogin()
        } else {
            templateForNoLogin()
        }
        //  渲染 NavItem Active
        activeNavItem()
        //  若未登入，則不需要初始化功能
        if (!data.me.id) {
            return
        }
        //  登出功能
        $('#logout').click(logout)
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
        //  生成 navbar template
        function templateForLogin() {
            //  登入狀態
            //  摺疊選單外的部份
            let template_outOfOffcanvas = `
                        <li class="nav-item d-none d-sm-inline-block">
                            <a class="nav-link" href="/square">廣場頁</a>
                        </li>
                        <!--純粹用作排版-->
                        <li style="flex-grow: 1;">
                        </li> 
                        <!--下拉選單-->
                        <li class="nav-item dropdown">
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
                        </li>
                        `
            //  摺疊選單內的部份
            let template_inOfOffcanvas = `
                        <ul class="navbar-nav justify-content-around">
                            <li class="nav-item">
                                <a class="nav-link" href="/self">個人頁面</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/album/list/${user_id}">文章相簿</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/setting/${user_id}">個人設置</a>
                            </li>
                            <li class="nav-item">
                                <a id="logout" class="btn btn-outline-success text-nowrap">登出</a>
                            </li>
                        </ul>
                        `
            //  #noNeedCollapse-list 內放入 NEWS
            $('#noNeedCollapse-list').html(template_outOfOffcanvas)
            //  #needCollapse-list 之外放入 個人資訊/文章相簿/設置/LOGOUT
            $('#needCollapse-list').html(template_inOfOffcanvas)
            //  根據網址，顯示 navbarItem active
        }
        function templateForNoLogin() {
            //  未登入
            //  navbar始終展開
            $('.navbar').removeClass('navbar-expand-sm').addClass('navbar-expand')
            //  基本nav始終排後面（未登入狀態僅會有 登入/註冊）
            $('.nav').removeClass('order-0 order-md-0').addClass('order-1')
            //  摺疊nav始終盤排前頭（未登入狀態僅會有Home）
            $('.offcanvas').removeClass('order-1 order-md-1').addClass('order-0')
            $('.navbar-toggler, .offcanvas').remove()
        }
        //  渲染 NavItem Active
        function activeNavItem() {
            let reg_pathname = /^\/(?<pathname>\w+)\/?(?<albumList>list)?/
            let { pathname, albumList } = reg_pathname.exec(location.pathname).groups
            if (pathname === 'self') {
                $(`.nav-link[href="/self"]`).addClass('active')
            } else if (pathname === 'setting') {
                $(`.nav-link[href="/setting"]`).addClass('active')
            } else if (pathname === 'square') {
                $(`.nav-link[href="/square"]`).addClass('active')
            } else if (albumList) {
                $(`.nav-link[href^="/album"]`).addClass('active')
            }
        }

        initFn(data)
        function initFn(data) {
            //  公用變量
            let $$news = pageData.news
            let $$htmlStr = $$news.htmlStr
            let $$newsList = $$news.newsList
            let $$excepts = $$news.excepts
            let $$num = $$news.num
            let $$fn = $$news.fn
            //  頁面數據
            let pageData = {
                me: data.me,
                news: {
                    htmlStr: {
                        confirm: '',
                        unconfirm: '',
                    },
                    newsList: {
                        confirm: [],
                        unconfirm: [],
                    },
                    excepts: {
                        idolFans: [],
                        articleReader: [],
                        msgReceiver: [],
                        num: 0
                    },
                    templateNeedToReset: false,
                    num: {
                        excepts: {
                            get count() {
                                let total = 0
                                for (let type in $$excepts) {
                                    total += $$excepts[type].length
                                }
                            }
                        },
                        newsList: {
                            get unconfirm() {
                                return $$newsList.unconfirm.length
                            },
                            get confirm() {
                                return $$newsList.confirm.length
                            },
                            get total() {
                                return this.confirm + this.unconfirm
                            }
                        },
                        db: {
                            confirm: 0,
                            unconfirm: 0,
                            total: 0
                        },
                        unRender: {
                            confirm: 0,
                            unconfirm: 0,
                            get total() {
                                return this.confirm + this.unconfirm
                            },
                            clear() {
                                this.confirm = 0
                                this.unconfirm = 0
                            }
                        },
                        rendered: {
                            confirm: 0,
                            unconfirm: 0,
                            get total() {
                                return this.confirm + this.unconfirm
                            },
                            clear() {
                                this.confirm = 0
                                this.unconfirm = 0
                            }
                        }
                    },
                    fn: {
                        listTotal(list) {
                            return list.confirm.length + list.unconfirm.length
                        },
                        itemIsExist(obj) {
                            return !!obj.confirm || !!obj.unconfirm
                        },
                        excepts: {
                            clear() {
                                for (let type in $$excepts) {
                                    $$excepts[type] = []
                                }
                            },
                            update(list) {
                                for (let { type, id } of list) {
                                    let prop = type === 1 ? 'idolFans' : type === 2 ? 'articleReader' : 'msgReceiver'
                                    $$excepts[prop].push(id)
                                }
                            }
                        },
                        newsList: {
                            clear() {
                                for (let isConfirm in $$newsList) {
                                    $$newsList[isConfirm] = []
                                }
                                //  一併清空 excepts
                                $$fn.excepts.clear()
                            },
                            //  更新 newsList、num.db、excepts
                            update(news) {
                                let { newsList, num } = news
                                $$num.db = num
                                if (!$$fn.listTotal(newsList)) {
                                    return
                                }
                                for (let isConfirm in newsList) {
                                    let list = newsList[isConfirm]
                                    $$newsList[isConfirm] = [...$$newsList[isConfirm], ...list]
                                    //  新增入 news.excepts
                                    $$fn.excepts.update(list)
                                }
                            },
                            reset(news) {
                                this.clear()
                                this.update(news)
                            }
                        },
                        htmlStr: {
                            //  生成通知列表內的相應html
                            _template(list) {
                                let { idolFans, articleReader, msgReceiver } = this._gen
                                return list.reduce((htmlStr, item) => {
                                    let { type, confirm } = item
                                    let type = item.type
                                    if (type === 1) {
                                        init += idolFans(item)
                                    } else if (type === 2) {
                                        init += articleReader(item)
                                    } else {
                                        init += msgReceiver(item)
                                    }
                                    let hr = confirm ? `<li data-my-hr="confirm-news-hr">` : `<li data-my-hr="unconfirm-news-hr">`
                                    hr += `<hr class="dropdown-divider"></li>`
                                    return htmlStr += hr
                                }, '')
                            },
                            _gen: {
                                idolFans({ confirm, id, fans, timestamp }) {
                                    let query = confirm ? '' : `?type=1&id=${id}`
                                    return `
                                    <!-- 新通知 of fans -->
                                    <li class="dropdown-item position-relative news-item">
                                        <a href="/other/${fans.id}${query}" class="stretched-link text-wrap ">
                                            <div>
                                                <span>${fans.nickname}追蹤你囉！</span><br>
                                                <span class='text-end mb-0'>${timestamp}</span>
                                            </div>
                                        </a>
                                    </li>`
                                },
                                articleReader({ confirm, id, blog, timestamp }) {
                                    let query = confirm ? '' : `?type=2&id=${id}`
                                    return `
                                    <li class="dropdown-item  position-relative news-item">
                                        <a href="/blog/${blog.id}${query}" class="stretched-link text-wrap">
                                            <div>
                                                <span>${blog.author.nickname} 有新文章唷！</span><br>
                                                <span>- ${blog.title}-</span><br>
                                                <span class='text-end mb-0'>${timestamp}</span>
                                            </div>
                                        </a>
                                    </li>`
                                },
                                msgReceiver({ confirm, id, comment, timestamp }) {
                                    let query = confirm ? '' : `?type=3&id=${id}`
                                    let { otherComments } = comment
                                    let count = otherComments.commenters.length
                                    let others = otherComments.commenters.map(({ nickname }) => nickname)
                                    let nicknames = comment.commenter.nickname +
                                        count > 1 ? others.slice(0, 2).join(',') + (count > 2 ? `與其他${count - 2}人` : '' + `，都`) :
                                        count === 1 ? others[0] : comment.commenter.nickname
                                    let author =
                                        comment.article.author.id === pageData.me.id ? '你' :
                                        comment.article.author.id === comment.commenter.id ? '自己' : comment.blog.author.nickname
                                    return `
                                    <li class="dropdown-item  position-relative news-item">
                                        <a href="/blog/${comment.article.id}${query}#comment_${comment.id}" class="stretched-link text-wrap">
                                            <div>
                                                <span>${nicknames}在${author}的文章「${comment.article.title}」留言囉！</span><br>
                                                <span class='text-end mb-0'>${timestamp}</span>
                                            </div>
                                        </a>
                                    </li>`
                                }
                            },
                            clear() {
                                $$num.unRender.clear()
                                for (let isConfirm in $$htmlStr) {
                                    curData[isConfirm] = ''
                                }
                            },
                            update(newsList) {
                                let list = newsList ? newsList : $$newsList
                                if (!$$fn.listTotal(list)) {
                                    return
                                }
                                for (let isConfirm in list) {
                                    let str = this._template(list[isConfirm])
                                    $$htmlStr[isConfirm] += str
                                    $$num.unRender[isConfirm] += list[isConfirm].length
                                }
                            },
                            reset(newsList) {
                                this.clear()
                                this.update(newsList)
                            }
                        },
                        newsDropdown: {
                            clear() {
                                //  清空新聞列表
                                $('.news-item').remove()
                                $('[data-my-hr]').remove()
                            },
                            insert(firstRender = false) {
                                if (!$$num.unRender.total) {
                                    return
                                }
                                //  針對通知列表進行渲染
                                for (let isConfirm in $$htmlStr) {
                                    let htmlStr = $$htmlStr[isConfirm]
                                    //  通知列表內的相應title
                                    let $title = $(`#${isConfirm}-news-title`)
                                    //  判斷newsItemList是否有內容
                                    if (!!!htmlStr) {
                                        //  htmlStr 沒有內容的狀況
                                        //  若初渲染，則隱藏title
                                        firstRender && show($title, false) 
                                        continue
                                    }
                                    //  htmlStr 有內容的狀況
                                    //  若title隱藏，則讓其顯示
                                    $title.is(':hidden') && show($title)
                                    //  相應此通知列表的item分隔線
                                    let hr = $(`[data-my-hr=${isConfirm}-news-hr]`)
                                    if (!hr.length) {
                                        //  此類型通知hr不存在，代表是首次渲染，item要渲染在title的後方
                                        $title.after(htmlStr)
                                    } else {
                                        //  此類型通知hr存在，代表非首次渲染，item要渲染在醉後一個hr的後方
                                        //  渲染在相應通知列的後方
                                        hr.last().after(htmlStr)
                                    }
                                    $$num.rendered[isConfirm] += num.unRender[isConfirm]
                                }
                                $$fn.htmlStr.clear()
                            }
                        }
                    }
                }
            }
            let $newsCount = $('.news-count')
            //  整理頁面初次渲染取得的newsData
            $$fn.newsList.reset(data.news)
            $$fn.htmlStr.update()
            $$fn.newsDropdown.insert(true)
            let count = curNum.db.unconfirm
            show($newsCount, count).text(count || '')

            async function autoReadMore() {
                let { data: { errno, data } } = await getNews(curNews.excepts)
                if (errno) {
                    //  處理例外狀況
                    return
                }
                let { news } = data
                let { hasNews, num, newsList } = news
                if (hasNews) {
                    $$fn.newsList.clear()
                    $$fn.htmlStr.clear()
                    $$fn.newsDropdown.clear()
                }
                $$fn.newsList.update(newsList)
                $$fn.htmlStr.update(newsList)
                
                let count = $$num.db.unconfirm
                    //  若hasNews:true -> 顯示DB數量
                    // hasNews ? curNum.db.unconfirm :
                    //  若hasNews:false -> 顯示DB數量-已渲染數量
                    // curNum.db.unconfirm - curNum.rendered.unconfirm
                show($newsCount, count).text(count || '')
            }

            async function readMore(){
                let { data: { errno, data } } = await getNews(curNews.excepts)
                if (errno) {
                    //  處理例外狀況
                    return
                }
            }




        }

        updateNewsList(true)
        //  渲染新通知筆數的提醒
        renderUnconfirmNewsCount()
        //  渲染新通知筆數的提醒
        function renderUnconfirmNewsCount() {
            let { unconfirm } = pageData.news.num
            let count = unconfirm.length
            //  新通知筆數的提醒
            let $newsCount = $('.news-count')
            //  渲染新通知筆數的提醒
            show($newsCount, count).text(count || '')
        }
        //  渲染readMore
        render_readMore()
        //  渲染 readMore鈕
        function render_readMore() {
            let total = pageData.news.num.total
            let { unconfirm, confirm } = pageData.news.newsList
            let hasMore = total - unconfirm.length - confirm.length > 0
            //  下拉選單內 的 readMore鈕                                                                                                                                                                                                
            let $readMore = $('#readMore')
            //  下拉選單內 的 沒有更多提醒
            let $noNews = $('#noNews')
            show($readMore, hasMore)
            show($noNews, !hasMore)
        }

        //  渲染新通知筆數的提醒
        function renderUnconfirmNewsCountByClick() {
            let { num, newsList: { unconfirm } } = pageData.news
            let count = num.unconfirm - unconfirm.length
            //  新通知筆數的提醒
            let $newsCount = $('.news-count')
            //  渲染新通知筆數的提醒
            show($newsCount, count).text(count || '')
        }
        //  下拉選單按鈕
        let $newsDropdown = $('#newsDropdown')
        $newsDropdown.click(renderUnconfirmNewsCountByClick)
        let timeSet
        async function debounce(fn, sec) {
            if (timeSet) {
                clearTimeout(timeSet)
            }
            timeSet = setTimeout(function () {
                new Promise((resolve, reject) => {
                    fn()
                    resolve()
                })
                    .then(_ => debounce(fn, sec))
                    .catch(err => { throw err })
            }, sec * 1000)
        }
        async function autoReadMore() {
            let { } = await
            }
        //  公用變量 ------




        //  ---------------------------------------------------------------------------
        window._news = pageData.news
        //  ---------------------------------------------------------------------------
        //  讀取更多
        $readMore.on('click', moreNews)


        //  handle -----
        //  請求更多通知
        async function moreNews() {
            let { news: { excepts } } = pageData.news
            //  取news
            let { data: { errno, data } } = await getNews(excepts)
            if (!errno) {
                //  處理錯誤
                return
            }
            let { news: { newsList, num, hasNews } } = data
            if (hasNews) {
                //  代表當前 pageData 都已過時
                //  pageData 重整
                pageData.reset({ newsList, num })
                //  新聞列表 重整
                resetNewsList()
            } else {
                //  pageData 更新
                pageData.update({ newsList, hasNews })
                //  新聞列表 更新
                updateNewsList()
            }
            //  未讀新聞數量的提醒
            renderUnconfirmNewsCountByClick()
            //  渲染 readMore
            render_readMore()
            return
        }

        //  utils ------
        //  顯示el與否
        function show(q, boo = true) {
            return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
        }
    }
}

//  請求 news
async function getNews(excepts) {
    let opts = {
        first: true
    }
    if (excepts) {   //  非初次渲染
        opts = {
            excepts,
            first: false
        }
    }
    let { data: { errno, data } } = await axios.post(`/api/news`, opts)
    if (errno) {
        //  處理未登入
        return { me: {} }
        //  處理報錯
    }
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
           },
           me: ...
       }
       */
    return data
}
}

export default initNavbar 