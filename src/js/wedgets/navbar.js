console.log('@navbar loading...')
import '../../css/wedgets/navbar.css'
import _axios from '../utils/_axios'
import Debounce from '../utils/Debounce'
import UI from '../utils/ui'

const CONST = {
    REG: {
        PAGE_REGISTER_OR_LOGIN: /^\/(login)|(register)/
    }
}
const NEWS = {
    DEBOUNCE_CONFIG: {
        auto: true,
        ms: 300 * 1000
    }
}
/* 初始化 通知列表 功能 */
export default async function () {
    let _data = { me: {} }
    activeNavItem()
    //  根據 path，顯示當前 active NavItem
    if(CONST.REG.PAGE_REGISTER_OR_LOGIN.test(location.pathname)){
        renderNoLoginNav()
        return _data
    }
    const { show } = UI
    let { errno, data }  = await getNews()
    // 取得「新聞」數據（含登入者資訊）
    if (!errno) {
        /* 登入狀態 */
        renderLoginNav(data.me.id)
        initNavFn(data)
        //  初始化登入狀態的nav
        _data = data
    } else {
        /* 登出狀態 */
        renderNoLoginNav()
    }
    return _data
    //  返回 getNews的數據，提供統整初始化頁面的函數initPageFn使用

    
    /* 初始化Nav功能 */
    function initNavFn(data) {
        /* 公用ele */
        let $readMore = $('#readMore')
        //  更多通知BTN
        let $noNews = $('#noNews')
        //  沒有更多通知BTN
        let $newsCount = $('.news-count')
        //  未讀取通知數
        let $newsDropdown = $('#newsDropdown')
        //  下拉選單按鈕
        let $$newsData = {
            /* nav 功能需要用的數據 */
            me: data.me,
            news: {
                newsDropdownOpen: false,
                //  標記，用來規避 autoReadMore 跟 readMore 同時進行
                readMoring: {
                    _value: false,
                    get status() {
                        return this._value
                    },
                    set status(value) {
                        this._value = value
                        $readMore.children('button').prop('disabled', value)
                    }
                },
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
                    get num() {
                        return this.idolFans.length + this.articleReader.length + this.msgReceiver.length
                    }
                },
                num: {
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
                                if (type !== 'num') {
                                    $$excepts[type] = []
                                }
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
                                //  confirm / unconfirm 的通知數據列表
                                $$newsList[isConfirm] = [...$$newsList[isConfirm], ...list]
                                //  加入 $$newsList 的 confirm / unconfirm 通知數據列表
                                $$fn.excepts.update(list)
                                //  新增入 news.excepts
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
                                if (type === 1) {
                                    htmlStr += idolFans(item)
                                } else if (type === 2) {
                                    htmlStr += articleReader(item)
                                } else {
                                    htmlStr += msgReceiver(item)
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
                                    comment.article.author.id === $$newsData.me.id ? '你' :
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
                                $$htmlStr[isConfirm] = ''
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
                        /* 管理已渲染的通知條目 */
                        clear() {
                            /* 清空頁面已渲染的通知條目 */
                            $('.news-item').remove()
                            //  清空新聞列表
                            $('[data-my-hr]').remove()
                            //  清空新聞列表分隔線
                            $$num.rendered.clear()
                            //  將 代表已渲染通知數據的數量 歸零
                        },
                        insert() {
                            /* 將未渲染的通知數據 渲染到頁面 */
                            if (!$$num.unRender.total) {
                                //  確認是否存在 未渲染的數據
                                return
                            }
                            let firstRender = $$num.unRender.total && !$$num.rendered.total
                            //  是否為通知列表的初次渲染(包含清空後的第一次)
                            for (let isConfirm in $$htmlStr) {
                                /* 渲染存放在 $$htmlStr 內的 htmlStr 數據 */
                                let htmlStr = $$htmlStr[isConfirm]
                                let $title = $(`#${isConfirm}-news-title`)
                                //  通知列表內的相應title
                                if (!!!htmlStr) {
                                    /* 處理 htmlStr 是空字符的狀況 */
                                    firstRender && show($title, false)
                                    // 初次渲染，要隱藏 $title
                                    continue
                                }
                                /* 處理 htmlStr 非空字符的狀況 */
                                $title.is(':hidden') && show($title)
                                //  若title呈隱藏，則讓其顯示
                                let hr = $(`[data-my-hr=${isConfirm}-news-hr]`)
                                //  相應此通知列表的item分隔線
                                if (!hr.length) {
                                    //  此類型通知hr不存在，代表是首次渲染此類型通知，item要渲染在title的後方
                                    $title.after(htmlStr)
                                } else {
                                    //  此類型通知hr存在，代表非首次渲染此類型通知，item要渲染在最後一個hr的後方
                                    //  渲染在相應通知列的後方
                                    hr.last().after(htmlStr)
                                }
                                $$num.rendered[isConfirm] += $$num.unRender[isConfirm]
                                //  更新 代表已被渲染的通知 數量
                            }
                            let count = $$num.db.total - $$num.rendered.total
                            //  未被前端渲染的通知條目數量
                            show($readMore, count)
                            //  顯示/隱藏「讀取更多」
                            show($noNews, !count)
                            //  顯示/隱藏「沒有更多」
                            $$fn.htmlStr.clear()
                        }
                    }
                }
            }
        }
        /* 公用 var */
        let $$news = $$newsData.news
        let $$readMoring = $$news.readMoring
        let $$htmlStr = $$news.htmlStr
        let $$newsList = $$news.newsList
        let $$excepts = $$news.excepts
        let $$num = $$news.num
        let $$fn = $$news.fn
        let debounce_autoReadMore = new Debounce(autoReadMore, NEWS.DEBOUNCE_CONFIG)
        /* 初始化 nav 各功能 */
        $$fn.newsList.reset(data.news)
        //  整理頁面初次渲染取得的 news(通知數據)
        $$fn.htmlStr.update()
        //  渲染 $$htmlStr 數據、更新當前與htmlStr相關的公用數據
        show($newsCount, $$num.db.unconfirm).text($$num.db.unconfirm || '')
        //  顯示 所有未確認過的通知數據 筆數
        $newsDropdown.on('show.bs.dropdown', () => { $$news.newsDropdownOpen = true })
        //  通知選單開啟時，更新 $$news.newsDropdownOpen
        $newsDropdown.on('hide.bs.dropdown', () => { $$news.newsDropdownOpen = false })
        //  通知選單開啟時，更新 $$news.newsDropdownOpen
        $newsDropdown.click(renderUnconfirmNewsCount)
        //  綁定「通知鈕」click handle → 顯示通知筆數
        $readMore.click(readMore)
        //  綁定「讀取更多鈕」click handle → 獲取更多通知數據、同時更新公開數據與渲染葉面
        $('#logout').click(logout)
        //  綁定「登出鈕」click handle → 登出功能
        debounce_autoReadMore.call()
        //  自動讀取更多
        async function logout(e) {
            let ready = confirm('真的要登出?')
            if (!ready) {
                alert('對嘛，再待一下嘛')
                return
            }
            let { data } = await _axios.get('/api/user/logout')
            alert(data)
            location.href = '/login'
        }
        function renderUnconfirmNewsCount() {
            /*  渲染新通知筆數的提醒 */
            if ($$num.unRender.total) {
                /* 若存在未渲染的通知數據，即進行渲染 */
                $$fn.newsDropdown.insert()
            }
            let count = $$num.db.unconfirm - $$num.rendered.unconfirm
            //  尚未被前端渲染的「未讀取通知」數據 的 筆數
            show($newsCount, count).text(count || '')
            //  顯示新通知筆數
        }
        async function autoReadMore() {
            if ($$readMoring.status || $$news.newsDropdownOpen) {
                /* 若 readMore 正在進行，強制停止請求 */
                return
            }
            $$readMoring.status = true
            //  更新readMoring
            let excepts = { ...$$excepts }
            //  提供給後端，過濾掉前端已收到的通知數據
            let { data: { news } } = await getNews({ excepts })
            let { hasNews, newsList } = news
            if (hasNews) {
                /* 後端確認到通知數據有變動，前端則清空、準備重置 */
                $$fn.newsList.clear()
                $$fn.htmlStr.clear()
                $$fn.newsDropdown.clear()
            }
            /* 發出請求前若已確認前端仍有未取得的通知數據，此處更新這次響應的通知數據 */
            $$fn.newsList.update(news)
            //  純粹數據的更新
            $$fn.htmlStr.update(newsList)
            //  純粹htmlStr的生成
            let count = $$num.db.unconfirm - $$num.rendered.unconfirm
            //  尚未被前端渲染的「未確認通知」數據 的 筆數
            show($newsCount, count).text(count || '')
            //  顯示未確認數據通知筆數
            $$readMoring.status = false
            //  更新readMoring
            console.log('@auto readMore OK...')
            return
        }
        async function readMore() {
            $$readMoring.status = true
            /* 標記 readMore 正在進行，強制停止 autoReadMore 的請求 */
            let excepts = { ...$$excepts }
            //  提供給後端，過濾掉前端已收到的通知數據
            let { data: { news } } = await getNews({ excepts })
            let { newsList, hasNews } = news
            if (hasNews) {
                /* 後端確認到通知數據有變動，前端則清空、準備重置 */
                $$fn.newsDropdown.clear()
                $$fn.newsList.clear()
                $$fn.htmlStr.clear()
            }
            $$fn.newsList.update(news)
            //  純粹數據的更新
            $$fn.htmlStr.update(newsList)
            //  純粹htmlStr的生成
            $$fn.newsDropdown.insert()
            //  插入庫存的htmlStr
            let count = $$num.db.unconfirm - $$num.rendered.unconfirm
            //  計算 前端尚未渲染到的整體未確認通知 的 筆數
            show($newsCount, count).text(count || '')
            $$readMoring.status = false
        }

    }
    //  渲染 未登入狀態的 navbar template
    function renderNoLoginNav() {
        //  未登入
        //  navbar始終展開
        $('.navbar').removeClass('navbar-expand-sm').addClass('navbar-expand')
        //  基本nav始終排後面（未登入狀態僅會有 登入/註冊）
        $('.nav').removeClass('order-0 order-md-0').addClass('order-1')
        //  摺疊nav始終盤排前頭（未登入狀態僅會有Home）
        $('.offcanvas').removeClass('order-1 order-md-1').addClass('order-0')
        $('.navbar-toggler, .offcanvas').remove()
    }
    //  渲染 登入狀態的 navbar template
    function renderLoginNav(user_id) {
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
                                <a class="nav-link" href="/album/list?owner_id=${user_id}">文章相簿</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/setting?owner_id=${user_id}">個人設置</a>
                            </li>
                            <li class="nav-item">
                                <a id="logout" class="btn btn-outline-success text-nowrap">登出</a>
                            </li>
                        </ul>
                        `
        //  #needCollapse-list 之外放入 個人資訊/文章相簿/設置/LOGOUT
        $('#needCollapse-list').html(template_inOfOffcanvas)
        //  #noNeedCollapse-list 內放入 NEWS
        $('#noNeedCollapse-list').html(template_outOfOffcanvas)
        return true

    }
    //  渲染 NavItem Active
    function activeNavItem() {
        let reg_pathname = /^\/(?<pathname>\w+)\/?(?<albumList>list)?/
        let { pathname, albumList } = reg_pathname.exec(location.pathname).groups
        $(`.nav-link[href^="/${pathname}"]`).addClass('active')
    }
    //  請求 news
    async function getNews(payload) {
        /* 響應的數據 { 
            errno, 
            data: {
                news : {
                    newsList: {
                        unconfirm: [
                            { type, id, timestamp, confirm, fans: ... }, ...
                            { type, id, timestamp, confirm, blog: ... }, ...
                            { type, id, timestamp, confirm, comment: ... }, ...
                        ],
                       confirm: [...]
                   },
                   num: { unconfirm, confirm, total },
                   hasNews: boo
               },
               me: ...
           }
        */
        return await _axios.post(`/api/news`, payload)
    }
}
