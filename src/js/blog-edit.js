if (process.env.NODE_ENV === 'development') {
    require('../views/blog-edit.ejs')
}
import '../css/blog-edit.css'
//  <!-- 引入 editor css -->
import '@wangeditor/editor/dist/css/style.css';
//  validate
import validates from './utils/validate'
//  <!-- 引入 Spark-MD5 -->
import SparkMD5 from 'spark-md5'
//  <!-- 引入 editor js -->
import { i18nAddResources, i18nChangeLanguage, createToolbar, createEditor } from '@wangeditor/editor'
import _ from 'lodash'

import UI from './utils/ui'
import genDebounce from './utils/genDebounce'
import _axios from './utils/_axios'
import _xss, { xssAndRemoveHTMLEmpty, xssAndTrim } from './utils/_xss'

import SERVER_CONST from '../../server/conf/constant'

import initPageFn from './utils/initData.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './wedgets/navbar.js'
//  初始化 Navbar
import initEJSData from './utils/initEJSData.js'
//  初始化來自ejs在頁面上的字符數據

window.addEventListener('load', async () => {
    const { BLOG: { HTML_MAX_LENGTH } } = SERVER_CONST
    const { genLoadingBackdrop, feedback } = UI
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
    } catch (error) {
        throw error
        location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }


    async function renderPage(data) {
        class genPayload extends Map {
            setKVpairs(dataObj) {
                //  將kv資料存入
                const entries = Object.entries(dataObj)
                if (entries.length) {
                    for (let [key, value] of entries) {
                        this._set(key, value)
                    }
                }
            }
            getPayload(kvPairs) {
                let res = {}
                for (let [key, value] of [...this]) {
                    res[key] = value
                }
                if (kvPairs) {
                    for (let key in kvPairs) {
                        res[key] = kvPairs[key]
                    }
                }
                return res
            }
            _set(key, value) {
                if (key === 'title') {
                    //  若刪除的是title，開啟更新鈕
                    $btn_updateTitle.prop('disabled', false)
                }
                this.set(key, value)
            }
            //  刪除數據
            _del(key) {
                this.delete(key)
                if (key === 'title') {
                    //  若刪除的是title，關閉更新鈕
                    $btn_updateTitle.prop('disabled', true)
                }
            }
        }
        /* 常數 */
        const CONST = {
            PUBLIC_OR_PRIVATE: {
                ACTION: 'pubOrPri'
            },
            CHANGE_TITLE: {
                ACTION: 'changeTitle'
            },
            UPDATE_TITLE: {
                ACTION: 'updateTitle',
                API: '/api/blog'
            },
            UPDATE_BLOG: {
                ACTION: 'updateBlog',
                API: '/api/blog'
            },
            REMOVE_BLOG: {
                ACTION: 'removeBlog',
                API: '/api/blog' //'/api/blog/initImgs'
            },
            CREATE_IMG: {
                API: '/api/blog/img',
                //  建立新圖API
            },
            CREATE_IMG_ALT: {
                API: '/api/blog/blogImgAlt'
                //  建立舊圖API
            },
            DATASET: {
                PREFIX: {
                    ACTION: 'action',
                    SELECTOR: 'selector'
                },
                ACTION(action) { return `[data-${this.PREFIX.ACTION}=${action}]` },
                SELECTOR(name) { return `[data-${this.PREFIX.SELECTOR}=${name}]` },
                NAME: {
                    WORD_COUNT: 'wordCount'
                },
                KEY: {
                    REMOVE_BLOG_ID: 'blog_id',
                    PAGE_IND: 'page_ind',
                    TURN_DIR: 'turn_dir'
                }
            },
            REG: {
                IMG: {
                    NAME_AND_EXT: /^(.+)\.(.+?)$/,
                    ALT_ID: /alt_id=(?<alt_id>\w+)/,
                    PARSE_TO_X_IMG: /<img.+?src=".+?alt_id=(?<alt_id>\d+?)"(.+?style="(?<style>.*?)")?(.*?)\/>/g
                }
            }

        }
        const { DATASET } = CONST
        /* 公用 JQ Ele */
        /* 公用 var */
        //  公用變量
        //  JQ Ele
        let $inp_changeTitle = $(DATASET.ACTION(CONST.CHANGE_TITLE.ACTION))
        let $btn_updateTitle = $(DATASET.ACTION(CONST.UPDATE_TITLE.ACTION))
        let $publicOrHidden = $(DATASET.ACTION(CONST.PUBLIC_OR_PRIVATE.ACTION))
        let $btn_removeBlog = $(DATASET.ACTION(CONST.REMOVE_BLOG.ACTION))
        let $wordCount = $(DATASET.SELECTOR(DATASET.NAME.WORD_COUNT))
        let $btn_updateBlog = $(DATASET.ACTION(CONST.UPDATE_BLOG.ACTION))
        let $$editor
        let $$pageData = data
        // ----------------------------------------------------------------------------------------
        window.pageData = $$pageData
        // ----------------------------------------------------------------------------------------
        let $$payload = new genPayload()
        $$pageData.payload = $$payload
        //  schema
        let $$htmlStr_maxLength = HTML_MAX_LENGTH

        try {
            //  初始化 input[name=show]
            // $publicOrHidden.prop('checked', $$pageData.blog.show)
            init_pageFuc()

            $('main, nav, main, footer').removeAttr('style')
            $$editor.focus()
        } catch (e) {
            console.log(`init blog-editor.ejs Err =>`, e)
        }
        //  初始化 頁面各功能
        function init_pageFuc() {
            //  editor
            $$editor = init_editor()
            backDrop.insertEditors([$$editor])
            initImgData()
            const debounce_handle_input = genDebounce(handle_input, {
                loading: () => $btn_updateTitle.prop('disabled', true)
                //  debounce階段時，限制更新鈕
            })
            //  $title handleInput => 驗證標題合法性
            $inp_changeTitle.on('input', debounce_handle_input)
            //  $title handleBlur => 若標題非法，恢復原標題
            $inp_changeTitle.on('blur', handle_blur)
            //  $btn_updateTitlebtn handleClick => 送出新標題
            $btn_updateTitle.on('click', handle_updateTitle)
            //  $show handleChange => 改變文章的公開狀態
            $publicOrHidden.on('change', handle_pubOrPri)
            //  $save handleClick => 更新文章
            $btn_updateBlog.on('click', handle_updateBlog)
            //  btn#remove 綁定 click handle => 刪除 blog
            $btn_removeBlog.on('click', handle_removeBlog)
            //  關於 刪除文章的相關操作
            async function handle_removeBlog(e) {
                if (!confirm('真的要刪掉?')) {
                    return
                }
                const data = {
                    blogList: [$$pageData.blog.id],
                    owner_id: $$pageData.blog.author.id
                }
                await _axios.delete(CONST.UPDATE_BLOG.API, { data })
                alert('已成功刪除此篇文章')
                location.href = '/self'
            }
            //  init函數

            // 初始化 編輯文章頁 的功能
            function init_editor() {
                //  editor 的 繁中設定
                i18nAddResources('tw', {
                    // 标题
                    header: {
                        title: '標題',
                        text: '文字',
                    },
                    blockQuote: {
                        title: '圖標'
                    },
                    // ... 其他语言词汇，下文说明 ...
                })
                i18nChangeLanguage('tw')
                const handle_change = genDebounce(_, {
                    loading: () => $btn_updateBlog.prop('disabled', true)
                })
                //  editor config
                const editorConfig = {
                    readOnly: true,
                    placeholder: '請開始撰寫文章內容...',
                    //  每次editor焦點/內容變動時調用
                    onChange: handle_change,
                    MENU_CONF: {
                        //  關於 upload img 的配置
                        uploadImage: {
                            //  圖片的上傳函數
                            customUpload,
                        },
                        //  關於 edit img 的配置
                        editImage: {
                            //  編輯前的檢查函數
                            checkImage
                        }
                    }
                }
                //  editor 編輯欄 創建
                const editor = createEditor({
                    //  插入後端取得的 html
                    html: $$pageData.blog.html || '',
                    selector: '#editor-container',
                    config: editorConfig,
                    mode: 'simple'
                })
                //  editor 工具欄 創建
                createToolbar({
                    editor,
                    selector: '#toolbar-container',
                    mode: 'simple'
                })
                //  初始化 payload.html
                $wordCount.text(`還能輸入${$$htmlStr_maxLength - editor.getHtml().length}個字`)
                return editor
                //  editor 的 修改圖片資訊前的檢查函數
                async function checkImage(src, alt, url) {
                    //  修改
                    let reg = CONST.REG.IMG.ALT_ID
                    let res = reg.exec(src)
                    let payload = {
                        blog_id: $$pageData.blog.id,
                        alt_id: res.groups.alt_id * 1,
                        alt: xssAndTrim(alt)
                    }
                    await _axios.patch('/api/album', payload)
                    //  尋找相同 alt_id
                    let imgData = $$pageData.blog.map_imgs.get(alt_id)
                    imgData.alt = alt
                    return true
                }
                //  editor的 自定義上傳圖片方法
                async function customUpload(img, insertFn) {
                    let { name, ext } = _getNameAndExt(img.name)
                    if (ext !== 'PNG' && ext !== 'JPG') {
                        alert('只能提供png與jpg的圖檔類型')
                        return
                    }
                    //  生成 img 的 hash(hex格式)
                    let { exist, blogImg_id, hash } = await _getHash(img)
                    let res
                    if (!exist) { // img為新圖，傳給後端建檔
                        console.log('進行新圖處理')
                        //  imgName要作為query參數傳送，必須先作百分比編碼
                        name = encodeURIComponent(name)
                        let api = `${CONST.CREATE_IMG.API}?hash=${hash}&name=${name}&ext=${ext}&blog_id=${$$pageData.blog.id}`
                        let formdata = new FormData()
                        //  創建 formData，作為酬載數據的容器
                        formdata.append('blogImg', img)
                        //  放入圖片數據
                        res = await _axios.post(api, formdata)
                        //  upload
                    } else { // img為重覆的舊圖，傳給後端新建一個blogImgAlt
                        console.log('進行舊圖處理')
                        res = await _axios.post(CONST.CREATE_IMG_ALT.API, { blogImg_id })
                    }
                    let { data: newImg } = res
                    console.log('完成 => ', newImg)
                    //  上傳成功
                    //  newImg格式:
                    /*{
                        "alt_id": 16,
                        "alt": "IMG_6362",
                        "blogImg_id": 8,
                        "name": "IMG_6362",
                        "img_id": 7,
                        "url": xxxxx
                    }
                    */
                    newImg.name = decodeURIComponent(newImg.name)
                    //  回傳的圖片名要做百分比解碼
                    $$pageData.blog.map_imgs.set(newImg.alt_id, newImg)
                    //  同步數據
                    insertFn(`${newImg.url}?alt_id=${newImg.alt_id}`, newImg.name)
                    //  將圖片插入 editor
                    console.log('完成圖片插入囉！-------------------------------------------------')
                    return
                    //  取得圖片的 hash
                    async function _getHash(img) {
                        //  取得 img 的 MD5 Hash(hex格式)
                        let hash = await _getMD5Hash(img)
                        let res = {
                            exist: false,
                            blogImg_id: undefined,
                            hash
                        }
                        let { map_imgs } = $$pageData.blog
                        if (map_imgs.size) {
                            //  利用hash，確認此時要上傳的img是否為舊圖
                            let imgs = [...map_imgs.values()]
                            //  img { alt_id, alt, blogImg_id, name, img_id, hash, url }
                            let target = imgs.find(img => img.hash === res.hash)
                            if (target) {
                                res.blogImg_id = target.blogImg_id
                                res.exist = true
                            }
                        }
                        return res
                        //  計算 file 的 MD5 Hash
                        function _getMD5Hash(file) {
                            return new Promise((resolve, reject) => {
                                let fr = new FileReader()
                                fr.readAsArrayBuffer(file)

                                fr.addEventListener('load', (evt) => {
                                    if (fr.readyState === FileReader.DONE) {
                                        let hash = SparkMD5.ArrayBuffer.hash(fr.result)
                                        resolve(hash)
                                        return
                                    }
                                })
                                fr.addEventListener('error', (error) => {
                                    reject(error)
                                    return
                                })
                            })
                        }
                    }

                    function _getNameAndExt(imgName) {
                        const reg = CONST.REG.IMG.NAME_AND_EXT
                        let [_, name, ext] = reg.exec(imgName)
                        return {
                            name: name.trim().toUpperCase(),
                            ext: ext.trim().toUpperCase()
                        }
                    }
                }
                //  handle：editor選區改變、內容改變時觸發
                async function _() {
                    console.log('handle_change 抓到囉！-------------------------------------------------')
                    if (!editor) {
                        //  editor尚未建構完成
                        return
                    }
                    const KEY = 'html'
                    let content = xssAndRemoveHTMLEmpty(editor.getHtml())
                    let errors = await validate({ html: content })
                    //  僅做html驗證
                    $$payload.setKVpairs({ [KEY]: content })
                    //  先存入payload
                    const error = !errors ? null : errors[KEY]
                    if (!error) {
                        $wordCount.text(`還能輸入${$$htmlStr_maxLength - content.length}個字`).removeClass('text-danger')
                        //  若html通過驗證，提示可輸入字數
                    } else if (error['maxLength']) {
                        $wordCount.text(`文章內容已超過${content.length - $$htmlStr_maxLength}個字`).addClass('text-danger')
                        //  提示html超出字數
                    } else if (error['minLength']) {
                        $wordCount.text(`文章內容不能為空`).addClass('text-danger')
                        //  提示html不可為空
                    } else if (error['diff']) {
                        $$payload._del(KEY)
                        //  若html與原本相同，刪去payload的html數據
                    }
                    await validateAll()
                    //  針對整體 payload 做驗證

                }
            }
            /* HANDLE --------------------------------------------------------------- */
            //  關於 更新文章的相關操作
            async function handle_updateBlog(e) {
                let payload = $$payload.getPayload()
                if ($$payload.has('html')) {
                    payload.html = parseImgToXImg(payload.html)
                    //  將<img>轉換為自定義<x-img>
                }
                //  整理出「預計刪除BLOG→IMG關聯」的數據
                let cancelImgs = getBlogImgIdList_needToRemoveAssociate()
                if (cancelImgs.length) { //  若cancel有值
                    payload.cancelImgs = cancelImgs //  放入payload
                }
                const errors = await validateAll()
                if (errors) {
                    let msg = ''
                    const invalidateMsg = Object.entries(errors)
                    for (let [key, obj] of invalidateMsg) {
                        if (key === 'all') {
                            msg += obj + '\n'
                            continue
                        } else if (key === 'html') {
                            key = '文章內容'
                        } else if (key === 'title') {
                            key = '文章標題'
                        } else if (key === 'show') {
                            key = '文章狀態'
                        }
                        msg += key + Object.values(obj).join(',') + '\n'
                    }
                    alert(msg)
                    return
                }
                payload.blog_id = $$pageData.blog.id
                payload.owner_id = $$pageData.blog.author.id
                await _axios.patch(CONST.UPDATE_BLOG.API, payload)
                for (let [key, value] of $$payload.entries()) {
                    $$pageData.blog[key] = value
                    //  同步數據
                }
                $$payload.clear()
                //  清空$$payload
                $btn_updateBlog.prop('disabled', true)
                //  此時文章更新鈕無法點擊
                if (confirm('儲存成功！是否預覽？（新開視窗）')) {
                    window.open(`/blog/${$$pageData.blog.id}?preview=true`)
                }
                return

                //  將<img>替換為自定義<x-img>
                function parseImgToXImg(html) {
                    let reg = CONST.REG.IMG.PARSE_TO_X_IMG
                    let res
                    let _html = html
                    while (res = reg.exec(html)) {
                        let {
                            alt_id,
                            style
                        } = res.groups
                        _html = _html.replace(res[0], `<x-img data-alt-id='${alt_id}' data-style='${style}'/>`)
                    }
                    return _html
                }
            }
            //  關於 設定文章公開/隱藏時的操作
            async function handle_pubOrPri(e) {
                let show = e.target.checked
                let KEY = 'show'
                let errors = await validateAll({ show })
                if (!errors || !errors[KEY]) {
                    //  代表合法，存入 payload
                    $$payload.setKVpairs({ [KEY]: show })
                } else if (errors[KEY]) {
                    //  代表非法
                    $$payload._del(KEY)
                    errors[KEY].hasOwnProperty('diff') && await validateAll()
                    //  若驗證錯誤是與原值相同，則測試當前payload
                }
                return
            }
            //  關於 更新title 的相關操作
            async function handle_updateTitle(e) {
                e.preventDefault()
                const KEY = 'title'
                const payload = {
                    blog_id: $$pageData.blog.id,
                    title: $$payload.get(KEY)
                }
                let msg
                let errors = await validate(payload)
                //  驗證
                feedback(3)
                //  清空提醒
                if (!errors || !errors[KEY]) {
                    //  代表合法
                    let { data } = await _axios.patch(CONST.UPDATE_BLOG.API, payload)
                    $$pageData.blog[KEY] = data[KEY]
                    //  同步數據
                    msg = '標題更新完成'
                } else {
                    const error = errors[KEY]
                    const values = Object.values(error)
                    if (values.length === 1) {
                        msg = '文章標題' + values[0]
                    } else {
                        msg = '文章標題' + values.join(',')
                    }
                }
                $$payload._del(KEY)
                await validateAll()
                alert(msg)
                return
            }
            //  關於 title 輸入新值後，又沒立即更新的相關操作
            async function handle_blur(e) {
                const KEY = 'title'
                let target = e.target
                let title = xssAndTrim(target.value)
                let errors = await validateAll({ [KEY]: title })
                if (!errors || !errors[KEY]) {
                    return
                }
                if (errors[KEY]) {
                    target.value = $$pageData.blog[KEY]
                    //  恢復原標題
                    errors[KEY].hasOwnProperty('diff') && await validateAll()
                    //  若驗證錯誤是與原值相同，則測試當前payload
                    return feedback(3, target)
                    //  移除非法提醒
                }

            }
            //  關於 title 輸入新值時的相關操作
            async function handle_input(e) {
                const KEY = 'title'
                const target = e.target
                let title = xssAndTrim(target.value)
                let errors = await validateAll({ [KEY]: title })
                if (!errors || !errors[KEY]) {
                    $$payload.setKVpairs({ [KEY]: title })
                    //  存入 payload
                    return feedback(2, target, true, '')
                    //  合法提醒    
                }
                const error = errors[KEY]
                if (error) {
                    $$payload._del(KEY)
                }
                if (error.hasOwnProperty('diff')) {
                    delete error.diff
                    await validateAll()
                }
                let msg
                const values = Object.values(error)
                if (!values.length) {
                    return feedback(3, target)
                } else if (values.length === 1) {
                    msg = '文章標題' + values[0]
                } else {
                    msg = '文章標題' + values.join(',')
                }
                //  若驗證錯誤是與原值相同，則測試當前payload
                return feedback(2, target, false, msg)
                //  顯示非法提醒
            }

            /* UTILS ------------------- */
            async function initImgData() {
                //  取出存在pageData.imgs的圖數據，但editor沒有的
                //  通常是因為先前editor有做updateImg，但沒有存文章，導致後端有數據，但editor的html沒有
                let cancelImgs = getBlogImgIdList_needToRemoveAssociate()
                //  整理要與該blog切斷關聯的圖片，格式為[{blogImg_id, blogImgAlt_list}, ...]
                if (!cancelImgs.length) { //  若cancel無值
                    return
                }
                const res = await _axios.patch(CONST.UPDATE_BLOG.API, {
                    cancelImgs,
                    blog_id: $$pageData.blog.id,
                    owner_id: $$pageData.blog.author.id
                })
                console.log('@@處理img res =>', res)
                //  整理img數據
                cancelImgs.forEach(({
                    blogImgAlt_list
                }) => {
                    blogImgAlt_list.forEach(alt_id => {
                        $$pageData.blog.map_imgs.delete(alt_id)
                    })
                })
            }
            /*  取出要移除的 blogImgAlt_id  */
            function getBlogImgIdList_needToRemoveAssociate() {
                let reg = CONST.REG.IMG.ALT_ID
                //  複製一份 blogImgAlt(由initEJSData取得)
                let map_imgs_needRemove = new Map($$pageData.blog.map_imgs)
                //  找出editor內的<img>數據[{src, alt, href}, ...]
                for (let { src } of $$editor.getElemsByType('image')) {
                    /* 藉由<img>的alt_id，將仍存在editor內的圖片 從 map_imgs_needRemove 過濾掉 */
                    let res = reg.exec(src)
                    if (!res || !res.groups.alt_id) {
                        continue
                    }
                    let alt_id = res.groups.alt_id * 1
                    //  alt_id是資料庫內的既存圖片
                    map_imgs_needRemove.delete(alt_id)
                }
                let cancelImgs = Array.from(map_imgs_needRemove).reduce((cancelImgs, [alt_id, { blogImg_id }]) => {
                    const index = cancelImgs.findIndex(img => img.blogImg_id === blogImg_id)
                    if (index < 0) {
                        //  代表還沒有與此圖檔相同的檔案，將此圖檔整筆記錄下來
                        cancelImgs.push({
                            blogImg_id,
                            blogImgAlt_list: [alt_id]
                        })
                    } else {
                        //  代表這張準備被移除的圖片，有一張以上的同檔
                        cancelImgs[index]['blogImgAlt_list'].push(alt_id)
                        //  將這張重複圖檔的alt_id，收入blogImgAlt_list
                    }
                    return cancelImgs
                }, [])
                if (cancelImgs.length) {
                    console.log('@要刪除的img,整理結果 => ', cancelImgs)
                }
                return cancelImgs
            }
            //  校驗blog數據，且決定submit可否點擊
            async function validate(data) {
                const _validate = validates.blog
                const errors = await _validate({ ...data, $$blog: $$pageData.blog })
                $btn_updateBlog.prop('disabled', !!errors)
                return errors
            }
            async function validateAll(kvPairs) {
                const blogData = $$payload.getPayload(kvPairs)
                return await validate(blogData)
            }
        }
    }
})