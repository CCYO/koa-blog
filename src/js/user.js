if (process.env.NODE_ENV === 'development') {
    require('../views/user.ejs')
}
import '../css/user.css'

import BetterScroll from 'better-scroll'
import _ from 'lodash'


import UI from './utils/ui'
import genDebounce from './utils/genDebounce'
import _axios from './utils/_axios'
import _xss from './utils/_xss'

import initPageFn from './utils/initData.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './wedgets/navbar.js'
//  初始化 Navbar
import initEJSData from './utils/initEJSData.js'

import ejs_str_relationShipItem from 'template-ejs-loader!../views/wedgets/user/relationshipItem.ejs'
import ejs_str_blogItem from 'template-ejs-loader!../views/wedgets/user/blogItem.ejs'

window.addEventListener('load', async () => {
    const { genLoadingBackdrop } = UI
    const backDrop = new genLoadingBackdrop()
    try {
        backDrop.show({blockPage: true})
        //  讀取中，遮蔽畫面
        let initPage = new initPageFn()
        await initPage.addOtherInitFn(initEJSData)
        //  初始化ejs
        await initPage.addOtherInitFn(initNavbar)
        //  初始化navbar
        await initPage.render(renderPage)
        //  統整頁面數據，並渲染需要用到統整數據的頁面內容
        backDrop.hidden()
        $('main, nav, main, footer').removeAttr('style')
        //  讀取完成，解除遮蔽
    } catch (error) {
        throw error
        location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }

    async function renderPage(data) {
        /* 常數 */
        const CONST = {
            URL: {
                LOGIN: '/login'
            },
            RELATIONSHIP_LIST: ['#fansList', '#idols'],
            CREATE_BLOG: {
                ACTION: 'createBlog',
                API: '/api/blog'
            },
            REMOVE_BLOG: {
                ACTION: 'removeBlog',
                API: '/api/blog'
            },
            REMOVE_BLOGS: {
                ACTION: 'removeBlogs',
                API: '/api/blog'
            },
            FOLLOW: {
                ACTION: 'follow',
                API: '/api/user/follow'
            },
            CANCEL_FOLLOW: {
                ACTION: 'cancelFollow',
                API: '/api/user/cancelFollow'
            },
            PAGE_NUM: {
                ACTION: 'pageNum'
            },
            TURN_PAGE: {
                ACTION: 'turnPage'
            },
            DATASET: {
                PREFIX: {
                    ACTION: 'action',
                    SELECTOR: 'selector'
                },
                ACTION(action) { return `[data-${this.PREFIX.ACTION}=${action}]` },
                SELECTOR(name) { return `[data-${this.PREFIX.SELECTOR}=${name}]` },
                NAME: {
                    SHOW_CREATE_BLOG_MODAL: 'showCreateBlogModal',
                    FANS_LIST: 'fansList',
                    IDOLS: 'idolList',
                    PUBLIC_BLOG_LIST: 'publicBlogList',
                    PRIVATE_BLOG_LIST: 'privateBlogList',
                    BLOG_BTN_LIST: 'blogBtnList'
                },
                KEY: {
                    REMOVE_BLOG_ID: 'blog_id',
                    PAGE_IND: 'page_ind',
                    TURN_DIR: 'turn_dir'
                }
            }
        }
        const { DATASET } = CONST
        const { NAME } = DATASET

        /* 公用 JQ Ele */
        let $btn_follow = $(DATASET.ACTION(CONST.FOLLOW.ACTION))
        //  追蹤鈕
        let $btn_cancelFollow = $(DATASET.ACTION(CONST.CANCEL_FOLLOW.ACTION))
        //  取消追蹤鈕
        let $btn_removeBlogs = $(DATASET.ACTION(CONST.REMOVE_BLOGS.ACTION))
        let $btn_removeBlog = $(DATASET.ACTION(CONST.REMOVE_BLOG.ACTION))
        let $fansList = $(DATASET.SELECTOR(NAME.FANS_LIST))
        //  粉絲列表contaner
        let $idols = $(DATASET.SELECTOR(NAME.IDOLS))
        //  偶像列表contaner

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

        let $$template = {
            fn: {
                relationshipItem: _.template(ejs_str_relationShipItem),
                blogItem: (data) => {
                    return _.template(ejs_str_blogItem)({
                        ACTION: DATASET.ACTION(CONST.REMOVE_BLOG).slice(1,-1),
                        KEY: DATASET.KEY.REMOVE_BLOG_ID,
                        ...data
                    })
                }
            },
            str: {
                blogItem: _.template(ejs_str_blogItem)({
                    ACTION: DATASET.ACTION(CONST.REMOVE_BLOG.ACTION).slice(1,-1),
                    KEY: DATASET.KEY.REMOVE_BLOG_ID,
                    $$isSelf,
                    $$me,
                    id: 0,
                    title: ' ',
                    time: ' ',
                    show: false
                })
            }
        }
        //  初始化BetterScroll
        //  public Var ----------------------------------------------------------------------
        let pageData = window.pageData = data
        //  ---------------------------------------------------------------------------------
        if ($$isSelf) {
            /* render */
            //  顯示建立新文章btn
            $(DATASET.SELECTOR(NAME.SHOW_CREATE_BLOG_MODAL)).removeClass('my-noshow')
            //  顯示編輯文章title
            $(DATASET.SELECTOR(NAME.PRIVATE_BLOG_LIST)).removeClass('my-noshow')
            //  隱藏文章編輯/刪除功能
            $(DATASET.SELECTOR(NAME.BLOG_BTN_LIST)).removeClass('my-noshow')

            /* event handle */
            //  綁定創建文章功能
            $(DATASET.ACTION(CONST.CREATE_BLOG.ACTION)).click(handle_createBlog)
            $btn_removeBlogs.length && $btn_removeBlogs.click(handle_removeBlogs)
            //  刪除全部文章btn → 綁定handle
            $btn_removeBlog.length && $btn_removeBlog.click(handle_removeBlog)
            //  刪除文章btn → 綁定handle
        } else {
            /* render */
            //  判端是否為自己的偶像，顯示追蹤/退追鈕
            const isMyIdol = $$fansList.some((fans) => fans.id === $$me.id)
            $btn_cancelFollow.toggleClass('my-noshow', !isMyIdol)
            $btn_follow.toggleClass('my-noshow', isMyIdol)
            /* event handle */
            //  綁定追蹤/退追功能
            $btn_follow.click(genFollowFn(true))
            $btn_cancelFollow.click(genFollowFn(false))
        }
        //  文章列表 的 頁碼，綁定翻頁功能
        $(DATASET.ACTION(CONST.PAGE_NUM.ACTION)).on('click', renderBlogList)
        //  文章列表 的 上下頁，綁定翻頁功能
        $(DATASET.ACTION(CONST.TURN_PAGE.ACTION)).on('click', renderBlogList)

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
            } = await _axios.post(CONST.CREATE_BLOG.API, {
                title
            })
            location.href = `/blog/edit/${id}?owner_id=${$$me.id}`

            //  取title值
            function getBlogTitle(value) {
                let val = value.trim()
                if (!val.length) {
                    return false
                }
                return _xss(value)
            }
        }
        //  刪除當前頁碼的所有文章
        async function handle_removeBlogs(e) {
            if (!confirm('真的要刪掉?')) {
                return
            }
            let $target = $(e.target)
            //  取得文章列表container
            let $blogList = $target.parents(DATASET.SELECTOR(NAME.PUBLIC_BLOG_LIST))
            $blogList = $blogList.length ? $blogList : $target.parents(DATASET.SELECTOR(NAME.PRIVATE_BLOG_LIST))
            //  取得當前文章列表的移除鈕
            let $children = [...$blogList.find(DATASET.ACTION(CONST.REMOVE_BLOG.ACTION))]
            //  取得所有移除鈕上的文章id
            let listOfBlogId = $children.reduce((init, cur) => {
                let id = cur.dataset[DATASET.KEY.REMOVE_BLOG_ID]
                init.push(id)
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
            let $container = $btn.parents(`[data-${DATASET.PREFIX.SELECTOR}]`).first()
            //  取得文章列表的性質(公開||隱藏)
            let pubOrPri = $container.dataset(DATASET.PREFIX.SELECTOR) === DATASET.NAME.PUBLIC_BLOG_LIST ? 'show' : 'hidden'
            //  pageData內的文章列表htmlStr數據
            let html_blogList = $$html_blogList[pubOrPri]
            //  pageData內的文章列表數據
            let data_blogList = $$blogs[pubOrPri]
            //  呈現文章列表的ul
            let $ul = $container.children('ul').first()
            //  當前頁碼(從0開始)
            let curInd = html_blogList.curInd
            //  目標頁碼(從0開始)
            let tarInd = $btn.attr(`data-${DATASET.KEY.PAGE_IND}`) ?
                $btn.attr(`data-${DATASET.KEY.PAGE_IND}`) * 1 : $btn.attr(`data-${DATASET.KEY.TURN_DIR}`) * 1 > 0 ?
                    curInd + 1 : curInd - 1
            //  從 pageData 取得當前列表頁的htmlStr數據
            let data_curList = html_blogList.html[curInd]
            if (!data_curList) { //   若無值
                //  將當前頁htmlStr存入pageData
                html_blogList.html[curInd] = $ul.html()
            }
            //  從 pageData 取得目標頁的htmlStr數據
            if (!html_blogList.html[tarInd]) { //   若無值
                let i = 5
                //  創建 目標頁 htmlStr
                let htmlStr = data_blogList[tarInd].reduce((init, { id, title, time, show }, ind) => {
                    init += $$template.fn.blogItem({
                        $$isSelf,
                        $$me,
                        id,
                        titie,
                        time,
                        show
                    })
                    i--
                    return init
                }, '')
                //  未滿 5 個，填入空白排版
                if (i > 0) {
                    for (i; i > 0; i--) {
                        htmlStr += $$template.str.blogItem
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
                const selector_pageNum = 'li.page-item'
                //  移除 頁碼列 的 .active .my-disable
                $container.find(selector_pageNum).removeClass('active my-disabled')
                //  上一頁btn
                let $back = $container.find(`${selector_pageNum}:first`)
                //  下一頁btn
                let $next = $container.find(`${selector_pageNum}:last`)
                //  當前文章列表的最後一頁頁碼(從0開始)
                let lastPageIndex = data_blogList.length - 1
                if (tarInd === 0) { // 若目標頁碼為0(第一頁)
                    //  上一頁 禁按
                    $back.addClass('my-disabled')
                } else if (tarInd === lastPageIndex) { //  //  若目標頁碼為最後一頁
                    //  下一頁 禁按
                    $next.addClass('my-disabled')
                }
                //  目標頁碼紐的容器，顯示為當前頁，並禁止點擊
                $container
                    .find(`[data-${DATASET.KEY.PAGE_IND}=${tarInd}]`).parent()
                    .addClass('active my-disabled')
            }
        }

        //  utils -----
        //  axios 刪除文章
        async function removeBlogs(blogList) {
            let owner_id = $$me.id
            //  送出刪除命令
            await _axios.delete(CONST.REMOVE_BLOG.API, {
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
                    alert(`請先登入`)
                    location.href = `${CONST.URL.LOGIN}?from=${location.pathname}`
                }
            }
            return async () => {
                /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
                let api = isfollow ? CONST.FOLLOW.API : CONST.CANCEL_FOLLOW.API
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
                        value: new BetterScroll(el, {
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
                let li = $$template.fn.relationshipItem({ me: $$me })
                //  在粉絲列表中插入 粉絲htmlStr
                if ($$fansList.length === 1) { //  如果追蹤者只有當前的你
                    $fansList.html(`<ul>${li}</ul>`)
                } else { //  如果追蹤者不只當前的你
                    //  插在最前面
                    $fansList.children('ul').prepend(li)
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
}
)