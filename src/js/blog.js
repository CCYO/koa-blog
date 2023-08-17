//  未完成

if (process.env.NODE_ENV === 'development') {
    require('../views/blog.ejs')
}
import '../css/blog.css'
import '@wangeditor/editor/dist/css/style.css';
// 引入 editor css
import { createEditor } from '@wangeditor/editor'
// 引入 editor js

import UI from './utils/ui'
import genDebounce from './utils/genDebounce'
import _axios from './utils/_axios'

import initPageFn from './utils/initData.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './wedgets/navbar.js'
//  初始化 Navbar
import initEJSData from './utils/initEJSData.js'
//  初始化來自ejs在頁面上的字符數據
window.addEventListener('load', async () => {
    const { genLoadingBackdrop } = UI
    const backDrop = new genLoadingBackdrop()
    try {
        backDrop.show({ blockPage: true })
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
        $('main, nav, main, footer').removeAttr('style')
    } catch (error) {
        throw error
        // location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }

    async function renderPage(data) {
        class initMyVar {
            myVar = new Map([
                ['editorList', []]
            ])
            getEditorList() {
                return this.myVar.get('editorList')
            }
            addEditor(editor) {
                let editorList = this.getEditorList()
                editorList.push(editor)
                this.myVar.set('editorList', editorList)
            }
            removeEditor(id) {
                let editorList = this.getEditorList()
                let index = editorList.findIndex(editor => editor.id === id)
                if (index < 0) {
                    return
                }
                editorList.splice(index, 1)
                this.myVar.set('editorList', editorList)
            }
        }
        let myVar = new initMyVar()
        //  初始化畫面
        //  渲染文章內容
        $('.editor-content-view').html(data.blog.html)
        //  若文章是預覽頁，或者非公開的，不需要作評論功能設定
        if (isPreview() || !data.blog.show) {
            $('.comment-container').remove()
            backDrop.hidden()
            return
        } else if (data.blog.comments.length) {
            $('.comment-list-container > .comment-list').html(data.blog.commentsHtmlStr)
            delete data.blog.commentsHtmlStr
        }

        //  初始化頁面功能
        //  公用變量
        let pageData = data
        // ----------------------------------------------------------------------------------------
        window.pageData = pageData
        // ----------------------------------------------------------------------------------------
        let api_comment = '/api/comment'
        let commentEditor_root = '.comment-container > .reply-box > .editor-container'

        //  移除非當前使用者留言的「刪除鈕」
        if (pageData.me.id) {
            $('button[data-remove]').each((index, btn) => {
                let $btn = $(btn)
                let notMyComment = $btn.data('user') * 1 !== pageData.me.id
                if (notMyComment) {
                    $btn.remove()
                }
            })
        }
        //  處理 因為comment通知前來此頁面，可以直接滑動至錨點
        if (location.hash) {
            location.href = location.hash
        }

        //  初始化根評論editor
        let editor = init_editor(document.querySelector(commentEditor_root))
        let container = editor.getEditableContainer().parentNode.parentNode.dataset.commentId

        $('.comment-list-container').on('click', (e) => {
            let target = e.target
            if (target.tagName !== 'BUTTON') {
                return
            }
            let replyBox = target.parentElement.nextElementSibling
            let editorContainer = replyBox.firstElementChild
            let isExist = typeof editorContainer.show === 'function'
            //  若是「刪除鈕」
            if (target.dataset.user) {
                //  再次確認
                if (!confirm('真的要刪除?')) {
                    isExist && !editorContainer.isFocused() && editorContainer.show()
                    return
                }
                //  執行刪除
                removeComment(replyBox)
                return
            }

            if (isExist) { //  若 editorContainer 有 show 方法，代表editor已被創建過
                //  顯示 editorContianer 即可
                editorContainer.show()
            } else {
                //  初始化editor
                init_editor(editorContainer)
            }
        })

        async function removeComment(replyBox) {
            let comment_id = replyBox.dataset.commentId * 1
            let payload = {
                author_id: pageData.blog.author.id,
                commenter_id: pageData.me.id,
                comment_id,
                blog_id: pageData.blog.id,
                pid: $(replyBox).parents('.comment-list').first().prev().first().data('commentId')
            }
            console.log('# => ', payload)

            let {
                data: {
                    errno,
                    data,
                    msg
                }
            } = await _axios.delete('/api/comment', {
                data: payload
            })
            if (errno) {
                alert(msg)
                return
            }
            let commentBox =
                replyBox.parentElement.firstElementChild.innerHTML = '<p>此留言已刪除</p>'
            replyBox.previousElementSibling.innerHTML = ''
            replyBox.innerHTML = ''
        }
        //  初始化editor
        function init_editor(container) {
            //  editor config

            //  功能：貼上純文字內容
            const customPaste = function (editor, event) {
                event.preventDefault()
                const text = event.clipboardData.getData('text/plain')
                editor.insertText(text)
            }
            let editorConfig = {
                MENU_CONF: {},
                customPaste,
                autoFocus: false
            }
            //  若container的父元素.replyBox的commentId不為0，則替editor添加onBlur handle
            if (container.parentElement.dataset.commentId * 1) {
                //  若此editor失去焦點，自動隱藏
                editorConfig.onBlur = function () {
                    $(container).hide()
                }
                editorConfig.autoFocus = true
            }
            //  editor config : placeholder
            editorConfig.placeholder = '我有話要說'
            //  editor 創建
            const editor = createEditor({
                config: editorConfig,
                selector: container,
                mode: 'simple'
            })
            backDrop.insertEditors([editor])
            //  重設editor自訂的相關設定
            resetEditor()
            return editor

            function resetEditor() {
                //  替container添加show方法
                container.show = () => {
                    $(container).show()
                    editor.focus()
                }
                container.blur = () => {
                    editor.blur()
                }
                container.isFocused = () => {
                    editor.isFocused()
                }
                //  div.replyBox
                let replyBox = editor.replyBox = container.parentElement
                //  editor 的 id
                let pid = editor.id = replyBox.dataset.commentId * 1
                //  editor 用來對 postComment 後，渲染 res 的方法
                let render = editor.render = (str) => {
                    if (pid) {
                        $(replyBox.nextElementSibling).append(str)
                    } else {
                        $(document.querySelector('.comment-list')).prepend(str)
                    }
                }
                //  將editor存入editorList，以便 loadEnd 關閉 editor 的功能
                myVar.addEditor(editor)
                //  為container綁定判斷登入狀態的handle
                container.addEventListener('click', isLogin)
                //  為container綁定送出留言的handle
                container.addEventListener('keyup', sendComment)

                async function sendComment(e) {
                    if (!isLogin()) {
                        return
                    }
                    //  判斷是否Enter
                    let isEnter = e.key === 'Enter'
                    if ((e.shiftKey && isEnter) || !isEnter) { //  若是，且不包含Shift
                        return
                    }
                    let htmlStr = editor.getHtml()
                    let reg = /(<p><br><\/p>)|(<p>[\s&nbsp;]+<\/p>)/g
                    let html = htmlStr.replace(reg, '')
                    //  撇除空留言
                    if (!html.trim()) {
                        editor.setHtml()
                        alert('請填入留言')
                        return
                    }

                    // loading(myVar.getEditorList())
                    backDrop.hidden()
                    //  送出請求
                    let {
                        data: {
                            errno,
                            data,
                            msg
                        }
                    } = await postComment()

                    if (errno) {
                        alert('留言失敗')
                        console.log(msg)
                        return
                    }
                    backDrop.hidden()

                    //  渲染此次送出的評論
                    renderComment()
                    //  更新評論數據    { id, html, time, pid, commenter: { id, email, nickname}}
                    updateComment(data)
                    //  清空評論框
                    editor.setHtml()

                    //  更新評論數據，comment: { id, html, time, pid, commenter: { id, email, nickname}}
                    function updateComment(comment) {
                        let {
                            id,
                            pid,
                            html,
                            time
                        } = comment
                        let commentId = pageData.blog.map_commentId
                        let commentPid = pageData.blog.map_commentPid
                        //  新建此評論為pid的commentPid
                        commentPid.set(id, [])
                        //  找出此評論的父評論列
                        let pidList = commentPid.get(pid)
                        if (!pid) { //    代表此評論的是隸屬根評論列
                            pidList.unshift(comment) //  加入父評論列，且排在該列最前方
                        } else { //    代表此評論隸屬子評論列
                            pidList.push(comment) //  加入子評論列，且排在該列最後方
                        }
                        //  更新父評論列
                        commentPid.set(pid, pidList)
                        //  更新子評論列
                        commentId.set(id, comment)
                    }
                    //  渲染評論 ---------------------------------------------------------------
                    //  要修改
                    //  ------------------------------------------------------------------------
                    function renderComment() {
                        //  創建評論htmlStr，data: { id, html, time, pid, commenter: { id, email, nickname}}
                        let template = templateComment(data)
                        console.log('@進入渲染函數')
                        //  渲染
                        editor.render(template)
                        //  創建評論
                        function templateComment({
                            id,
                            html,
                            time,
                            commenter
                        }) {
                            return `
                                <div class="comment-box" id="comment_${id}">
                                    <div>${html}</div>
                                    <div>
                                        By<a href="/other/${commenter.id}">${commenter.nickname}</a> 於 ${time} 發佈
                                        <button>回覆</button>
                                        <button data-remove=${id} data-user=${commenter.id}>刪除</button>
                                    </div>

                                    <div class="reply-box" data-comment-id="${id}">
                                        <div class="editor-container"></div>
                                    </div>
                                    <div class="comment-list"></div>
                                </div>
                            `
                        }

                    }
                    //  送出創建評論的請求
                    async function postComment() {
                        let article_id = pageData.blog.id
                        let commenter_id = pageData.me.id
                        //  若 文章作者 = 留言者，payload加入author: 留言者id，否則undefined


                        let payload = {
                            article_id,
                            commenter_id, //  留言者
                            author_id: pageData.blog.author.id, //  文章作者
                            html,
                            pid: editor.id ? editor.id : null //  editor 若為 0，代表根評論
                        }

                        return await _axios.post(api_comment, payload)
                    }
                }
            }
        }
        //  確認是否為文章預覽頁面
        function isPreview() {
            let reg = /preview=(?<preview>.+)&?/
            let query = window.location.search
            let res = reg.exec(query)
            let preview = res ? res.groups.preview : false
            return preview
        }
        //  確認是否登入
        function isLogin() {
            if (pageData.me.id) { //  若登入，無需動作
                return true
            }
            if (confirm('請先登入')) { //  未登入，前往登入頁
                location.href = `/login?from=${location.pathname}`
            }
            return false
        }
    }

})