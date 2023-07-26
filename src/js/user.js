import '../css/user.css'

import UI from './utils/ui'
import genDebounce from './utils/genDebounce'
import _axios from './utils/_axios'

import initPageFn from './utils/initData.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './wedgets/navbar.js'
//  初始化 Navbar
import initEJSData from './utils/initEJSData.js'

if (process.env.NODE_ENV === 'development') {
    require('../views/user.ejs')
}

window.addEventListener('load', async () => {
    const { genLoadingBackdrop } = UI
    const backDrop = new genLoadingBackdrop()
    try {
        backDrop.show(true)
        //  讀取中，遮蔽畫面
        let initPage = new initPageFn()
        await initPage.addOtherInitFn(initEJSData)
        //  初始化ejs
        await initPage.addOtherInitFn(initNavbar)
        //  初始化navbar
        await initPage.render(renderPage)
        //  統整頁面數據，並渲染需要用到統整數據的頁面內容
        backDrop.hidden()
        //  讀取完成，解除遮蔽
    } catch (error) {
        throw error
        location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }

    async function renderPage(data) {
        let CONST = {
            URL: {
                CREATE_BLOG: '/api/blog',
                DELETE_BLOG: '/api/blog',
                FOLLOW: '/api/user/follow',
                CANCEL_FOLLOW: '/api/user/cancelFollow',
                LOGIN: '/login'
            },
            RELATIONSHIP_LIST: ['#fansList', '#idols']
        }
        /* 公用 JQ Ele */
        let $btn_follow = $('#follow')
        //  追蹤鈕
        let $btn_cancelFollow = $('#cancelFollow')
        //  取消追蹤鈕
        let $fansList = $('#fansList')
        //  粉絲列表contaner
        let $idols = $('#idols')
        //  偶像列表contaner
        let $btn_removeBlogs = $('[data-my-remove-blogs]')
        let $btn_removeBlog = $('[data-my-remove-blog]')
        /* 公用 var */
        let $$pageData = {
            me: data.me,
            currentUser: data.currentUser,
            fansList: data.fansList,
            idols: data.idols,
            blogs: data.blogs,
            html_blogList: {
                show: {
                    html: [],
                    curInd: 0
                },
                hidden: {
                    html: [],
                    curInd: 0
                }
            },
            betterScrollEles: initBetterScroll([$fansList, $idols]),
        }
        let $$me = $$pageData.me
        let $$currentUser = $$pageData.currentUser
        let $$isSelf = $$currentUser.id === $$me.id
        let $$fansList = $$pageData.fansList
        let $$html_blogList = $$pageData.html_blogList
        let $$blogs = $$pageData.blogs
        let $$betterScrollEles = $$pageData.betterScrollEles
        //  初始化BetterScroll
        //  public Var ----------------------------------------------------------------------
        let pageData = window.pageData = data
        //  ---------------------------------------------------------------------------------
        if ($$isSelf) {
            /* render */
            //  顯示建立新文章btn
            $('#newBlog').removeClass('my-noshow')
            //  顯示編輯文章title
            $('[data-my-blog-key=hidden]').removeClass('my-noshow')
            //  隱藏文章編輯/刪除功能
            $('.btn-blog-edit').removeClass('my-noshow')
            /* event handle */
            //  綁定創建文章功能
            $('#sendBlogTitle').click(handle_createBlog)
            $btn_removeBlogs.length && $btn_removeBlogs.click(handle_removeBlogs)
            //  刪除全部文章btn → 綁定handle
            $btn_removeBlog.length && $btn_removeBlog.click(handle_removeBlog)
            //  刪除文章btn → 綁定handle
        } else {
            /* render */
            //  判端是否為自己的偶像，顯示追蹤/退追鈕
            let isMyIdol = $$fansList.some((fans) => fans.id === $$me.id)
            $btn_cancelFollow.toggleClass('my-noshow', !isMyIdol)
            $btn_follow.toggleClass('my-noshow', isMyIdol)
            /* event handle */
            //  綁定追蹤/退追功能
            $btn_follow.click(genFollowFn(true))
            $btn_cancelFollow.click(genFollowFn(false))
        }
        //  文章列表 的 頁碼，綁定翻頁功能
        $('[data-my-key].page-link').on('click', renderBlogList)
        //  文章列表 的 上下頁，綁定翻頁功能
        $('[data-my-way].page-link').on('click', renderBlogList)
        $('main, nav, main, footer').removeAttr('style')
        //  handle -------
        //  handle => 創建 blog
        async function handle_createBlog(e) {
            let title = getBlogTitle($('#blogTitle').val())
            if (!title) {
                alert('標題不能為空')
                return
            }
            const {
                data: {
                    id
                }
            } = await _axios.post(CONST.URL.CREATE_BLOG, {
                title
            })
            location.href = `/blog/edit/${id}?owner_id=${$$me.id}`

            //  取title值
            function getBlogTitle(value) {
                let val = value.trim()
                if (!val.length) {
                    return false
                }
                return filterXSS(value)
            }
        }
        //  刪除當前頁碼的所有文章
        async function handle_removeBlogs(e) {
            if (!confirm('真的要刪掉?')) {
                return
            }
            let $target = $(e.target)
            //  取得文章列表container
            let $blogList = $target.parents('[data-my-blog-key]')
            //  取得當前文章列表的移除鈕
            let $children = [...$blogList.find('[data-my-remove-blog]')]
            //  取得所有移除鈕上的文章id
            let listOfBlogId = $children.reduce((init, cur) => {
                init.push($(cur).data('my-remove-blog'))
                return init
            }, [])
            removeBlogs(listOfBlogId)
            return
        }
        //  刪除單篇文章功能
        async function handle_removeBlog(e) {
            if (!confirm('真的要刪掉?')) {
                return
            }
            let $target = $(e.target)
            //  要被刪除的文章id
            let id = $target.data('my-remove-blog')
            //  送出刪除命令
            await removeBlogs([id])
            return
        }
        //  渲染文章列表
        function renderBlogList(e) {
            e.preventDefault()
            //  觸發handle的el(頁碼紐||上下頁紐)
            let $btn = $(e.target)
            //  取得文章列表的性質(公開||隱藏)
            let pubOrPri = $btn.parents('div.blogList').data('my-blog-key')
            //  呈現文章列表的ul
            let $ul = $(`[data-my-blog-key=${pubOrPri}] ul.list-group`)
            //  pageData內的文章列表htmlStr數據
            let html_blogList = $$html_blogList[pubOrPri]
            //  pageData內的文章列表數據
            let data_blogList = $$blogs[pubOrPri]
            //  當前頁碼(從0開始)
            let curInd = html_blogList.curInd
            //  目標頁碼(從0開始)
            let tarInd = getTargetPage()

            //  從 pageData 取得當前列表頁的htmlStr數據
            let data_curList = html_blogList.html[curInd]
            if (!data_curList) { //   若無值
                //  將當前頁htmlStr存入pageData
                html_blogList.html[curInd] = $ul.html()
            }
            //  從 pageData 取得目標頁的htmlStr數據
            let html_tarInd = html_blogList.html[tarInd]
            if (!html_tarInd) { //   若無值
                let i = 5
                //  創建 目標頁 htmlStr
                let htmlStr = data_blogList[tarInd].reduce((init, {
                    id,
                    title,
                    time,
                    show
                }) => {
                    init += templateCreator_BlogList({
                        id,
                        title,
                        time,
                        show
                    })
                    i--
                    return init
                }, '')
                //  未滿 5 個，填入空白排版
                if (i > 0) {
                    for (i; i > 0; i--) {
                        htmlStr += `<li
                            class="list-group-item list-group-item-info d-flex align-items-center justify-content-between">
                            <div class="text-truncate me-3">
                                <span class="invisible">x</span>
                            </div>
                            <div class="btn-blog-edit flex-shrink-0 invisible">
                                <a class='btn btn-outline-primary btn-sm' href=''>編輯</a>
                                <a class='btn btn-outline-primary btn-sm'>刪除</a>
                            </div>
                        </li>`
                    }
                }
                //  更新pageData
                html_blogList.html[tarInd] = htmlStr
            }

            //  更新頁碼條UI
            UI_page()
            //  渲染 目標頁 htmlStr
            $ul.html(html_blogList.html[tarInd])
            //  更新 pageData 的 htmlStr數據
            html_blogList.curInd = tarInd

            //  UI 頁碼條
            function UI_page() {
                //  當前文章列表的container
                let $list = $(`[data-my-blog-key=${pubOrPri}]`)
                //  移除 頁碼列 的 .active .my-disable
                $list.find('li.page-item').removeClass('active my-disabled')
                //  上一頁btn
                let $back = $list.find(`li.page-item:first`)
                //  下一頁btn
                let $next = $list.find(`li.page-item:last`)
                //  當前文章列表的最後一頁頁碼(從0開始)
                let lastPageIndex = data_blogList.length - 1
                if (tarInd === 0) { // 若目標頁碼為0(第一頁)
                    //  上一頁 禁按
                    $back.addClass('my-disabled')
                } else if (tarInd === lastPageIndex) { //  //  若目標頁碼為最後一頁
                    //  下一頁 禁按
                    $next.addClass('my-disabled')
                }
                //  目標頁碼紐的容器
                let $tarPage = $list.find(`a.page-link[data-my-ind=${tarInd}]`).parent()
                //  顯示為當前頁，並禁止點擊
                $tarPage.addClass('active my-disabled')
            }
            //  創建文章列表 htmlStr
            function templateCreator_BlogList({
                id,
                title,
                time,
                show
            }) {
                let author_id = $$me.id
                let editOrShow = show ? '發佈於' : '上一次編輯'
                //  依頁面是否為使用者自己的資料，來判斷是否提供文章的編輯/刪除紐
                let blogEdit = $$isSelf ? `
                            <div class="btn-blog-edit">
                                <a class='btn btn-outline-primary btn-sm' href="/blog/edit/${id}?owner_id=${author_id}">編輯</a>
                                <a class='btn btn-outline-primary btn-sm' data-my-remove-blog="${id}">刪除</a>
                            </div>` : ''

                return `                    
                        <li class="list-group-item list-group-item-action list-group-item-info d-flex align-items-center justify-content-between">
                            <div>
                                <a class="stretched-link" href="/blog/${id}">${title}</a>
                            </div>
                            <div class="d-none d-sm-block">
                                <span class="timestamp">${editOrShow} ${time}</span>
                            </div>
                            ${blogEdit}
                        </li>
                    `
            }
            //  取得目標頁碼
            function getTargetPage() {
                //  判斷觸發紐是頁碼||上下頁
                let typeOfTarget = $btn.attr('data-my-ind') ? 'page' : 'dir'
                //  取得目表頁碼
                if (typeOfTarget === 'page') { // 頁碼觸發
                    //  則觸發紐的[data-my-ind]即為目標頁碼
                    return $btn.data('my-ind')
                } else if (typeOfTarget === 'dir') { //上下頁觸發
                    //  則以當前頁碼做計算
                    return $btn.data('my-way') === 'next' ? curInd + 1 : curInd - 1
                }
            }
        }

        //  utils -----
        //  axios 刪除文章
        async function removeBlogs(blogList) {
            let owner_id = $$me.id
            //  送出刪除命令
            await _axios.delete(CONST.URL.DELETE_BLOG, {
                data: {
                    blogList,
                    owner_id
                }
            })
            location.href = '/self'
            //  刷新頁面
        }

        //  生成 追蹤功能handle
        function genFollowFn(isfollow) {
            if (!$$me.id) {
                /* 若未登入，跳轉到登入頁 */
                return () => {
                    alert('請先登入')
                    location.href = `${CONST.URL.LOGIN}?from=${location.pathname}`
                }
            }
            return async () => {
                /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
                let api = isfollow ? CONST.URL.FOLLOW : CONST.URL.CANCEL_FOLLOW
                //  取出URL
                await _axios.post(api, {
                    id: $$currentUser.id
                })
                //  發出 取消/追蹤 請求
                _updateFollowTemplate(isfollow)
                //  更新追蹤/退追的瀏覽器數據與頁面渲染
            }
        }

        //  init ----
        //  初使化 BetterScroll
        function initBetterScroll(JQ_Eles) {
            let betterScrollEles = []
            // 調整粉絲、追蹤列表
            for (let $el of JQ_Eles) {
                let el = $el[0]
                Object.defineProperties(el, {
                    betterScroll: {
                        value: BetterScroll.createBScroll(el, {
                            scrollX: true,
                            scrollY: false,
                            mouseWheel: true
                        }),
                        writable: false
                    },
                    canScroll: {
                        get() {
                            let outerW = $el.first().outerWidth()
                            let contentW = $el.children(':first-child').outerWidth(true)
                            return outerW < contentW
                        }
                    }
                })
                el.handleResize = function () {
                    if (el.canScroll) {
                        el.betterScroll.enable()
                    } else {
                        el.betterScroll.disable()
                    }
                    el.betterScroll.refresh()
                    //  enable() 不知道為何，有時候仍沒辦法作用，搭配refresh()就不會有意外
                }
                window.addEventListener('resize', genDebounce(el.handleResize))
                betterScrollEles.push(el)
            }
            Object.defineProperty(betterScrollEles, 'refresh', {
                value() {
                    for (let el of betterScrollEles) {
                        el.handleResize()
                    }
                },
                enumerable: false
            })
            betterScrollEles.refresh()
            return betterScrollEles
        }

        /* 不會親手調用的函數 */
        function _updateFollowTemplate(isfollow) {
            if (isfollow) {
                follow()
            } else {
                cancelFollow()
            }
            $$betterScrollEles.refresh()
            //  重整 BetterScroll
            $btn_follow.toggle()
            //  追蹤鈕的toggle
            $btn_cancelFollow.toggle()
            //  退追鈕的toggle
            return
            //  處理關於追蹤的瀏覽器數據與頁面渲染
            function follow() {
                alert('已追蹤')
                //  更新追蹤名單
                $$fansList.unshift($$me)
                //  生成 粉絲htmlStr
                let li = `
                    <li class="card" data-fans-id="${$$me.id}">
                        <div class="ratio ratio-1x1">
                            <img src="${$$me.avatar}" class="card-img-top" alt="">
                        </div>
                        <div class="text-truncate">
                            <a href="/other/${$$me.id}" class="stretched-link">${$$me.nickname}</a>
                        </div>
                    </li>`
                //  在粉絲列表中插入 粉絲htmlStr
                let listBox = $(`#fansList`)
                if ($$fansList.length === 1) { //  如果追蹤者只有當前的你
                    // $(`#fansList`).html(`<ul class="d-inline-flex p-0">${li}</ul>`)
                    $fansList.html(`<ul>${li}</ul>`)
                } else { //  如果追蹤者不只當前的你
                    //  插在最前面
                    $fansList.children('ul').prepend(li)
                    // $(`#fansList > ul`).prepend(li)
                }
            }
            //  處理關於退追的瀏覽器數據與頁面渲染
            function cancelFollow() {
                alert('已退追')
                //  更新追蹤名單
                $$fansList.splice($$fansList.indexOf($$me.id), 1)
                //  在粉絲列表中移除 粉絲htmlStr
                if ($$fansList.length > 0) { //  如果追蹤者不只有當前的你
                    //  直接移除
                    $(`li[data-fans-id='${$$me.id}']`).remove()
                } else { //  如果沒追蹤者
                    $fansList.html(`<p>可憐阿，沒有朋友</p>`)
                }
            }
        }
    }
})

if (module.hot) {
    module.hot.accept('./utils/genDebounce', function () {
        console.log('genDebounce OK!');
    })
}