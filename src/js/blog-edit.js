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
                    NAME_AND_EXT: /^(.+)\.(.+?)$/
                }
            }

        }
        const { DATASET } = CONST
        /* 公用 JQ Ele */
        /* 公用 var */
        //  公用變量

        //  API
        let api_initImg = '/api/blog/initImgs'
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
            window.editor = $$editor
            initImgData()
            //  $title handleInput => 驗證標題合法性
            $inp_changeTitle.on('input', handle_input)
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
                my_alert('已成功刪除此篇文章')
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
                const toolbar = createToolbar({
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
                    let reg = /alt_id=(?<alt_id>\w+)/
                    let res = reg.exec(src)
                    let alt_id = res.groups.alt_id * 1
                    let blog_id = $$pageData.blog.id
                    alt = _xss(alt)
                    await _axios.patch('/api/album', { blog_id, alt_id, alt })
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
                        let { map_imgs} = $$pageData.blog
                        if (map_imgs.size) {
                            //  利用hash，確認此時要上傳的img是否為舊圖
                            let imgs = [...map_imgs.values()]
                            //  img { alt_id, alt, blogImg_id, name, img_id, hash, url }
                            let target = imgs.find( img => img.hash === res.hash)
                            if(target){
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
                async function handle_change() {
                    if (!editor) {
                        //  editor尚未建構完成
                        return
                    }
                    const KEY = 'html'
                    let content = xssAndRemoveHTMLEmpty(editor.getHtml())
                    let errors = await validate({ html: content })
                    $$payload.setKVpairs({ [KEY]: content })
                    if (!errors) {
                        $wordCount.text(`還能輸入${$$htmlStr_maxLength - content.length}個字`).removeClass('text-danger')
                        return
                    }
                    const error = errors[KEY]
                    if (error['maxLength']) {
                        $wordCount.text(`文章內容已超過${content.length - $$htmlStr_maxLength}個字`).addClass('text-danger')
                    } else if (error['minLength']) {
                        $wordCount.text(`文章內容不能為空`).addClass('text-danger')
                    } else if (error['diff']) {
                        $$payload._del(KEY)
                    }
                    await validateAll()
                }
            }
            /* HANDLE --------------------------------------------------------------- */
            //  關於 更新文章的相關操作
            async function handle_updateBlog(e) {
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
                    let reg = /<img.+?src=".+?alt_id=(?<alt_id>\d+?)"(.+?style="(?<style>.*?)")?(.*?)\/>/g
                    let res
                    let _html = html
                    while (res = reg.exec(html)) {
                        if (res) {
                            let {
                                alt_id,
                                style
                            } = res.groups
                            _html = _html.replace(res[0], `<x-img data-alt-id='${alt_id}' data-style='${style}'/>`)
                        }
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

                //  整理要與該blog切斷關聯的圖片，格式為[{blogImg_id, blogImgAlt_list}, ...]
                let cancelImgs = getBlogImgIdList_needToRemoveAssociate()

                if (!cancelImgs.length) { //  若cancel無值
                    console.log('@initPage階段，沒有需要移除的 img')
                    return
                }
                console.log('@initPage階段，需要移除的 img 為 => alt_id:', cancelImgs)
                await _axios.patch(CONST.UPDATE_BLOG.API, {
                    cancelImgs,
                    blog_id: $$pageData.blog.id,
                    owner_id: $$pageData.blog.author.id
                })
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
                let reg = /alt_id=(?<alt_id>\w+)/
                //  複製一份 blogImgAlt(由initEJSData取得)
                let map_imgs_needRemove = new Map([...$$pageData.blog.map_imgs])
                //  找出[{src, alt, href}, ...]
                editor.getElemsByType('image').forEach(({
                    src
                }) => {
                    let res = reg.exec(src)
                    if (!res && !res.groups.alt_id) {
                        return
                    }
                    let alt_id = res.groups.alt_id * 1
                    //  alt_id是資料庫內的既存圖片
                    map_imgs_needRemove.delete(alt_id)
                    //  從 map_imgs_needRemove 過濾掉目前仍於 content 內的「既存圖片」
                    return
                })
                let cancelImgs = []

                map_imgs_needRemove.forEach(({ blogImg_id }, alt_id) => {
                    let ok = cancelImgs.some((img, index) => {
                        if (img.blogImg_id === blogImg_id) {
                            //  若存在，代表這張準備被移除的圖片，有一張以上的同檔
                            cancelImgs[index]['blogImgAlt_list'].push(alt_id)
                            //  將這張重複圖檔的alt_id，收入blogImgAlt_list
                            return true
                        }
                    })
                    if (!ok) {
                        //  代表還沒有與此圖檔相同的檔案
                        //  將此圖檔整筆記錄下來
                        cancelImgs.push({
                            blogImg_id,
                            blogImgAlt_list: [alt_id]
                        })
                    }
                })

                console.log('@要刪除的img,整理結果 => ', cancelImgs)
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

//  初始化 valicator
function init_valicator(schema) {
    let Ajv = window.ajv7
    let ajv = new Ajv({
        allErrors: true
    })
    //  定義 keyword: diff，定義不可與現存的表格值相同
    ajv.addKeyword({
        keyword: 'diff',
        type: ['string', 'number', 'boolean'],
        schemaType: 'string',
        validate: function _(inputName, newData) {
            let curData = $$pageData.blog[inputName]
            if (newData !== curData) {
                return true
            }
            if (!_.errors) {
                _.errors = []
            }
            _.errors.push({
                keyword: 'diff'
            })
            return false
        },
        errors: true
    })
    //  生成驗證函數
    let valicate = ajv.compile(schema)
    //  返回驗證器
    return (newData) => {
        if (!valicate(newData)) { //  代表非法
            let list_inputNameAndMessage = valicate.errors.map(error => {
                //  取得造成非法的相關資訊
                let {
                    inputName,
                    message,
                    keyword
                } = inputNameAndMessage(error)
                //  移除payload非法的數據
                $$payload.delete(inputName)
                return {
                    inputName,
                    message,
                    keyword
                }
            })
            return list_inputNameAndMessage
        } else { //  代表合法
            return []
        }
    }
    //  提取非法訊息的 { inputName, message } 
    function inputNameAndMessage(error) {
        let {
            instancePath,
            keyword,
            params
        } = error
        //  instancePath 格式為 /xxx
        let inputName = instancePath.slice(1)
        let value = params ? [...Object.entries(params)][0][1] : undefined
        let message
        switch (keyword) {
            case 'type':
                message = `數據格式必須為${value}`
                break
            case 'minLength':
                message = `不能少於${value}個字元`
                break
            case 'maxLength':
                message = `不能多於${value}個字元`
                break
            case 'if':
                message = '請寫內文，不然幹嘛公開文章'
                break
            case 'diff':
                let name =
                    inputName === 'title' ? '標題' :
                        inputName === 'html' ? '內文' :
                            '文章公開/隱藏設定'
                message = `與當前的${name}相同，若沒有要更新就別鬧了`
                break
            case 'minProperties':
                message = '沒有要變動就別亂'
                break
            default:
                message = `錯誤訊息的keyword為${keyword} -- 未知的狀況`
                break;
        }
        return {
            inputName,
            message,
            keyword
        }
    }
}