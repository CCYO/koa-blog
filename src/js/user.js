/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === 'development') {
    require('../views/user.ejs')
}
import ejs_str_fansItem from 'template-ejs-loader!../views/wedgets/user/fansItem.ejs'
//  使用 template-ejs-loader 將 偶像粉絲列表的項目ejs檔 轉譯為 純字符
import ejs_str_blogItem from 'template-ejs-loader!../views/wedgets/user/blogItem.ejs'
//  使用 template-ejs-loader 將 blog文章項目的ejs檔 轉譯為 純字符
import ejs_str_blogList from 'template-ejs-loader!../views/wedgets/user/blogList.ejs'

/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import '../css/user.css'

/* ------------------------------------------------------------------------------------------ */
/* NPM Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import BetterScroll from 'better-scroll'
import lodash from 'lodash'

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
    Debounce as $M_Debounce,
    _axios as $M_axios,
    _xss as $M_xss,
    wedgets as $M_wedgets,
    validate as $M_validate,
    ui as $M_ui,
    log as $M_log
} from './utils'


/* ------------------------------------------------------------------------------------------ */
/* Const --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */


window.$j = $
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
            // SHOW_CREATE_BLOG_MODAL: 'showCreateBlogModal',
            FANS_LIST: 'fansList',
            IDOLS: 'idolList',
            // PUBLIC_BLOG_LIST: 'publicBlogList',
            // PRIVATE_BLOG_LIST: 'privateBlogList',
            // BLOG_BTN_LIST: 'blogBtnList'
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

const CONS = {
    API: {
        FOLLOW: '/api/user/follow',
        CANCEL_FOLLOW: '/api/user/cancelFollow',
        CREATE_BLOG(blog_id, author_id) {
            return `/blog/edit/${blog_id}?owner_id=${author_id}`
        }
    },
    ACTION: {
        FOLLOW: '[data-action=follow]',
        CANCEL_FOLLOW: '[data-action=cancelFollow]',
        REMOVE_BLOGS: 'removeBlogs',
        REMOVE_BLOG: 'removeBlog',
        CREATE_BLOG: '[data-action=createBlog]',
        PAGE_NUM: '[data-action=pageNum]',
        TURN_PAGE: '[data-action=turnPage]',
    },
    SELECTOR: {
        NEW_BLOG_MODAL: '#new_blog_modal',
        NEW_BLOG_TITLE: '#new_blog_title',
        FANS_LIST: '[data-selector=fansList]',
        IDOL_LIST: '[data-selector=idolList]',
        PRIVATE_BLOG_LIST: '[data-selector=privateBlogList]',
        PUBLIC_BLOG_LIST: '[data-selector=publicBlogList]',
        BLOG_ID: '[data-blog_id]',
        BLOG_LIST: 'blog_list'
    },
    KEY: {
        BLOG_ID: 'blog_id',
        SHOW: 'show',
        PAGE_TURN: 'turn',
        PAGE_NUM: 'page'
    },
    VALUE: {
        TURN_PLUS: 'plus',
        TURN_MINUS: 'minus'
    }

}
/* ------------------------------------------------------------------------------------------ */
/* Class --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const $C_backdrop = new $M_wedgets.LoadingBackdrop()
//  讀取遮罩

/* ------------------------------------------------------------------------------------------ */
/* Run --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
window.addEventListener('load', async () => {
    try {
        $C_backdrop.show({ blockPage: true })
        //  讀取中，遮蔽畫面
        let initPage = new $M_wedgets.InitPage()
        //  幫助頁面初始化的統整函數
        await initPage.addOtherInitFn($M_wedgets.initEJSData)
        //  初始化ejs
        await initPage.addOtherInitFn($M_wedgets.initNavbar)
        //  初始化navbar
        await initPage.render(renderPage)
        //  統整頁面數據，並渲染需要用到統整數據的頁面內容
        $C_backdrop.hidden()
        //  讀取完成，解除遮蔽
    } catch (error) {
        throw error
        // location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }

    async function renderPage(data) {
        /* ------------------------------------------------------------------------------------------ */
        /* Public Var ------------------------------------------------------------------------------- */
        /* ------------------------------------------------------------------------------------------ */
        window.pageData = data
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
            }
        }
        const $$isLogin = $$pageData.me.id ? true : false
        const $$isSelf = $$pageData.currentUser.id === $$pageData.me.id
        /* 公用 JQ Ele */
        let $input_blog_title = $(CONS.SELECTOR.NEW_BLOG_TITLE)
        let $btn_create_blog = $(CONS.ACTION.CREATE_BLOG)
        let $fansList = $(CONS.SELECTOR.FANS_LIST).length ? $(CONS.SELECTOR.FANS_LIST).eq(0) : undefined
        //  粉絲列表contaner
        let $idols = $(CONS.SELECTOR.IDOL_LIST).length ? $(CONS.SELECTOR.IDOL_LIST).eq(0) : undefined
        //  偶像列表contaner
        let $btn_follow = $(CONS.ACTION.FOLLOW)
        //  追蹤鈕
        let $btn_cancelFollow = $(CONS.ACTION.CANCEL_FOLLOW)
        //  取消追蹤鈕
        let $blog_list = $(`[data-selector=${CONS.SELECTOR.BLOG_LIST}`)

        let $btn_removeBlogs = $(CONS.ACTION.REMOVE_BLOGS)
        let $btn_removeBlog = $(CONS.ACTION.REMOVE_BLOG)


        /* 公用 var */
        let $$me = $$pageData.me

        let $$html_blogList = $$pageData.html_blogList
        let $$blogs = $$pageData.blogs

        let $$template = {
            fn: {
                relationshipItem: lodash.template(ejs_str_fansItem),
                blogItem: (data) => {
                    return lodash.template(ejs_str_blogItem)({
                        ACTION: DATASET.ACTION(CONST.REMOVE_BLOG).slice(1, -1),
                        KEY: CONS.KEY.BLOG_ID,
                        ...data
                    })
                }
            },
            str: {
                blogItem: lodash.template(ejs_str_blogItem)({
                    ACTION: DATASET.ACTION(CONST.REMOVE_BLOG.ACTION).slice(1, -1),
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

        //  public Var ----------------------------------------------------------------------
        let pageData = window.pageData = data
        //  ---------------------------------------------------------------------------------

        //  初始化BetterScroll
        /* Self Page */
        if ($$isSelf) {
            /* event handle */
            let { call: debounce_check_title } = new $M_Debounce(check_title, {
                loading(e) {
                    $btn_create_blog.prop('disabled', true)
                    $M_ui.feedback(1, e.target)
                }
            })
            $input_blog_title.on('input', debounce_check_title)
            //  handle 校驗blog title
            $btn_create_blog.on('click', handle_createBlog)
            //  綁定創建文章功能
            $blog_list.on('click', handle_removeBlogs)
            //  handle 刪除單一/全部文章
            $btn_create_blog.prop('disabled', true)
        } else {
            /* render */
            //  判端是否為自己的偶像，顯示追蹤/退追鈕
            const isMyIdol = $$isLogin ? $$pageData.fansList.some((fans) => fans.id === $$me.id) : false
            $btn_cancelFollow.toggle(isMyIdol)
            $btn_follow.toggle(!isMyIdol)
            /* event handle */
            //  綁定追蹤/退追功能
            $btn_follow.on('click', follow)
            $btn_cancelFollow.on('click', cancelFollow)
        }
        let $$blogList = window.$$blogList = {
            "1": {
                currentPage: 1,
                blogs: []
            },
            "0": {
                currentPage: 1,
                blogs: []
            },
            count: 5
        }
        for (let type in $$pageData.blogs) {
            let blogs = $$pageData.blogs[type]
            blogs = blogs.reduce((acc, list, index) => {
                acc.push(...list)
                return acc
            }, [])
            if (!blogs.length) {
                continue
            }
            let { show } = blogs[0]
            console.log('@blogs => ', blogs)
            $$blogList[show ? '1' : '0'].blogs = [...blogs]
            // let $container = $(`[data-selector=${CONS.SELECTOR.BLOG_LIST}][data-${CONS.KEY.SHOW}=${show ? "1" : "0"}]`)
            // let htmlStr = lodash.template(ejs_str_blogList)({ isSelf: $$isSelf, blogs })
            // $container.append(htmlStr)
        }
        // lodash.template(ejs_str_blogList, {
        //     blogs: 
        // })
        //  文章列表 的 頁碼，綁定翻頁功能
        // $(CONS.ACTION.PAGE_NUM).on('click', renderBlogList)
        //  文章列表 的 上下頁，綁定翻頁功能
        // $(CONS.ACTION.TURN_PAGE).on('click', renderBlogList)
        $blog_list.on('click', handle_turn_page)

        async function handle_turn_page(e) {
            /* 確認翻頁模式 */
            let $target = $(e.target)
            let num = $target.data('turn')
            if (!num) {
                return
            }
            e.preventDefault()
            let show = $(e.currentTarget).data(CONS.KEY.SHOW) * 1
            let { blogs, currentPage } = $$blogList[show]
            let mode = num === CONS.VALUE.TURN_PLUS ? 'PLUS' :
                num === CONS.VALUE.TURN_MINUS ? 'MINUS' : num * 1
            let targetPage = mode === 'PLUS' ? currentPage + 1 :
                mode === 'MINUS' ? currentPage - 1 : mode
            let ul_targetPage = $(e.currentTarget).find(`ul[data-page=${targetPage}]`)
            if(!ul_targetPage.length){
                //  要跟後端要資料
                let targetBlogs = [...blogs].splice($$blogList.count * (targetPage - 1), $$blogList.count)
                //  渲染資料
                let html = lodash.template(ejs_str_blogList)({
                    isSelf: $$isSelf,
                    page: targetPage,
                    blogs: targetBlogs
                })
                let $el = $(e.currentTarget).find(`[data-${CONS.KEY.PAGE_NUM}]`).last()
                console.log('@$el => ', $el)
                $el.after(html)
            }else{
                //  使用Bootstrap JS方法
            }
            //  更改頁碼

        }
        //  渲染文章列表-----------------------------------------------------------
        function renderBlogList(e) {
            e.preventDefault()

            let $btn = $(e.target)
            //  觸發handle的el(頁碼紐||上下頁紐)
            let $container = $btn.parents(`[data-${DATASET.PREFIX.SELECTOR}]`).first()
            //  取得文章列表的性質(公開||隱藏)
            let pubOrPri = $container.dataset('selector') === 'publicBlogList' ? 'show' : 'hidden'
            // let pubOrPri = $container.dataset(DATASET.PREFIX.SELECTOR) === DATASET.NAME.PUBLIC_BLOG_LIST ? 'show' : 'hidden'
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
                $container.find(selector_pageNum).removeClass('active pe-none')
                //  上一頁btn
                let $back = $container.find(`${selector_pageNum}:first`)
                //  下一頁btn
                let $next = $container.find(`${selector_pageNum}:last`)
                //  當前文章列表的最後一頁頁碼(從0開始)
                let lastPageIndex = data_blogList.length - 1
                if (tarInd === 0) { // 若目標頁碼為0(第一頁)
                    //  上一頁 禁按
                    $back.addClass('pe-none')
                } else if (tarInd === lastPageIndex) { //  //  若目標頁碼為最後一頁
                    //  下一頁 禁按
                    $next.addClass('pe-none')
                }
                //  目標頁碼紐的容器，顯示為當前頁，並禁止點擊
                $container
                    .find(`[data-${DATASET.KEY.PAGE_IND}=${tarInd}]`).parent()
                    .addClass('active pe-none')
            }
        }
        //  渲染文章列表-----------------------------------------------------------

        $('main, nav, main, footer').removeAttr('style')
        let $$betterScrollEles = initBetterScroll([$fansList, $idols])
        //  初始化betterScroll
        /* ------------------------------------------------------------------------------------------ */
        /* Handle ------------------------------------------------------------------------------------ */
        /* ------------------------------------------------------------------------------------------ */
        async function handle_removeBlogs(e) {
            let $target = $(e.target)
            let action = $target.attr('data-action')
            if (!action || (action && !confirm('真的要刪除嗎?'))) {
                return
            }
            e.preventDefault()
            checkLogin()
            let blogList = action === CONS.ACTION.REMOVE_BLOG ? [$target.parents('li').data(CONS.KEY.BLOG_ID)] :
                Array.from($(e.currentTarget).find(`ul.list-group > li[data-${CONS.KEY.BLOG_ID}]`)).map(li => $(li).data(CONS.KEY.BLOG_ID))
            let owner_id = $$pageData.me.id
            //  送出刪除命令
            let { errno } = await $M_axios.delete(CONST.REMOVE_BLOG.API, {
                data: {
                    blogList,
                    owner_id
                }
            })
            if (errno) {
                return
            }
            alert('刪除成功')
            location.reload()
            //  刷新頁面
        }
        async function handle_createBlog() {
            let title = await check_title()
            if (!title) {
                return
            }
            const {
                data: {
                    id
                }
            } = await $M_axios.post(CONST.CREATE_BLOG.API, {
                title
            })
            location.href = CONS.API.CREATE_BLOG(id, $$pageData.me.id)
        }
        async function check_title() {
            let title = $input_blog_title.val()
            let input = $input_blog_title.get(0)

            title = $M_xss.xssAndTrim(input.value)
            let validateErrors = await $M_validate.blog({
                $$blog: { title: '' },
                title
            }, false)
            $btn_create_blog.prop('disabled', validateErrors)
            if (validateErrors) {
                delete validateErrors.title.diff
                validateErrors = $M_validate.parseErrorsToForm(validateErrors)
                let msg = validateErrors[input.name]
                $M_ui.feedback(2, input, false, msg.feedback)
                return false
            }
            $M_ui.feedback(2, input, true)
            return title
        }
        async function follow() {
            checkLogin()
            //  檢查登入狀態
            /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
            await $M_axios.post(CONS.API.FOLLOW, {
                id: $$pageData.currentUser.id
            })
            //  發出 取消/追蹤 請求
            /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
            $$pageData.fansList.unshift($$me)
            //  同步 $$fansList 數據
            let li = $$template.fn.relationshipItem({ me: $$me })
            //  在粉絲列表中插入 粉絲htmlStr
            if ($$pageData.fansList.length === 1) {
                //  如果追蹤者只有當前的你
                $fansList.html(`<ul>${li}</ul>`)
            } else {
                //  如果追蹤者不只當前的你
                $fansList.children('ul').prepend(li)
                //  插在最前面
            }
            $$betterScrollEles.refresh()
            //  重整 BetterScroll
            $btn_follow.toggle(false)
            //  追蹤鈕的toggle
            $btn_cancelFollow.toggle(true)
            //  退追鈕的toggle
            alert('已追蹤')
            return
        }
        async function cancelFollow() {
            checkLogin()
            //  檢查登入狀態
            /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
            await $M_axios.post(CONS.API.CANCEL_FOLLOW, {
                id: $$pageData.currentUser.id
            })
            //  發出 取消/追蹤 請求
            /* 更新追蹤/退追的瀏覽器數據與頁面渲染 */
            $$pageData.fansList.splice($$pageData.fansList.indexOf($$me.id), 1)
            //  在粉絲列表中移除 粉絲htmlStr
            if ($$pageData.fansList.length > 0) {
                //  如果仍有追蹤者
                $(`li[data-fans-id='${$$me.id}']`).remove()
                //  直接移除
            } else {
                //  如果已無追蹤者
                $fansList.html(`<p>可憐阿，沒有朋友</p>`)
                //  撤換掉列表內容
            }
            //  同步 $$fansList 數據
            $$betterScrollEles.refresh()
            //  重整 BetterScroll
            $btn_follow.toggle(true)
            //  追蹤鈕的toggle
            $btn_cancelFollow.toggle(false)
            //  退追鈕的toggle
            alert('已退追')
            return
        }
        /* ------------------------------------------------------------------------------------------ */
        /* Utils ------------------------------------------------------------------------------------ */
        /* ------------------------------------------------------------------------------------------ */
        function initBetterScroll(JQ_Eles) {
            let betterScrollEles = []
            //  存放 betterScroll 實例的DOM Ele
            /* 調整粉絲、追蹤列表 */
            for (let $el of JQ_Eles) {
                let el = $el && $el.get(0)
                //  若$el存在，取其 DOM Ele
                if (!el) {
                    continue
                    //  若 DOM Ele 不存在，跳至下個循環
                }
                /* 賦予DOM Ele兩個Prop，betterScroll、canScoll */
                Object.defineProperties(el, {
                    /* Prop:betterScroll 此屬性指向以DOM Ele本身創建的betterScroll實例 */
                    betterScroll: {
                        value: new BetterScroll(el, {
                            scrollX: true,
                            scrollY: false,
                            mouseWheel: true
                        }),
                        writable: false
                    },
                    /* Prop:canScroll 此屬性代表DOM Ele本身的betterScroll是否可滾動 */
                    canScroll: {
                        get() {
                            let outerW = $el.eq(0).outerWidth()
                            let contentW = $el.children(':first-child').outerWidth(true)
                            console.log(`@ outerW: ${outerW} --- contentW: ${contentW}`)
                            return outerW < contentW
                            //  若DOM Ele的外寬度 < first-child Ele外寬，則代表本身的 betterScroll 可滾動
                        }
                    },
                    /* Method: resetBetterScroll，藉由el.canScroll啟動|停止滾動功能*/
                    resetBetterScroll: {
                        value() {
                            $M_log.dev_log('resetBetterScroll...')
                            if (el.canScroll) {
                                /* 若當前是可滾動狀態，調用 betterScroll.enable實例方法，開啟滾動功能 */
                                el.betterScroll.enable()
                            } else {
                                /* 若當前不是可滾動狀態，調用 betterScroll.disable實例方法，禁止滾動功能 */
                                el.betterScroll.disable()
                            }
                            $M_log.dev_log(`${el.dataset.selector}是${el.canScroll ? '可' : '不可'}滾動狀態`)
                            el.betterScroll.refresh()
                            //  調用 betterScroll.refresh實例方法，重整狀態
                            //  betterScroll.enable 不知道為何，有時候仍沒辦法作用，搭配refresh()就不會有意外
                        }
                    }
                })
                const { call: debounce_reset_betterScroll } = new $M_Debounce(el.resetBetterScroll)
                //  創造 防抖動的 el.handleResize
                window.addEventListener('resize', debounce_reset_betterScroll)
                //  將每個防抖動的 el.handleResize 綁定到 window
                betterScrollEles.push(el)
                //  將每個el都放入betterScrollEles
            }
            /* 為 betterScrollEles 創建方法，內部所有el重新啟動|停止滾動功能*/
            betterScrollEles.refresh = function () {
                for (let el of betterScrollEles) {
                    // el.handleResize()
                    el.resetBetterScroll()
                }
            }
            betterScrollEles.refresh()
            return betterScrollEles
        }
        function checkLogin() {
            if ($$isLogin) {
                return
            }
            /* 若未登入，跳轉到登入頁 */
            alert(`請先登入`)
            location.href = `${CONST.URL.LOGIN}?from=${encodeURIComponent(location.href)}`
        }
    }
}
)