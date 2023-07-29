if (process.env.NODE_ENV === 'development') {
    require('../views/blog-edit.ejs')
}
import '../css/blog-edit.css'
//  <!-- 引入 editor css -->
import '@wangeditor/editor/dist/css/style.css';
//  <!-- 引入 Spark-MD5 -->
//  <!-- 引入 Ajv -->
//  <!-- 引入 editor js -->
import { createToolbar, createEditor} from '@wangeditor/editor'
import _ from 'lodash'
import xss from 'xss'

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
        //  讀取完成，解除遮蔽
    } catch (error) {
        throw error
        location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }


    async function renderPage(data) {
        let pageData = data
        // ----------------------------------------------------------------------------------------
        window.pageData = pageData
        // ----------------------------------------------------------------------------------------
        /* 常數 */
        const CONST = {
            PUBLIC_OR_HIDDEN: {
                ACTION: 'publicOrHidden'
            },
            CHANGE_TITLE: {
                ACTION: 'changeTitle'
            },
            UPDATE_TITLE: {
                ACTION: 'updateTitle',
                API: '/api/blog'
            },
            REMOVE_BLOG: {
                ACTION: 'removeBlog',
                API: '/api/blog/initImgs'
            },
            DATASET: {
                PREFIX: {
                    ACTION: 'action',
                    SELECTOR: 'selector'
                },
                ACTION(action) { return `[data-${this.PREFIX.ACTION}=${action}]` },
                SELECTOR(name) { return `[data-${this.PREFIX.SELECTOR}=${name}]` },
                NAME: {
                    
                },
                KEY: {
                    REMOVE_BLOG_ID: 'blog_id',
                    PAGE_IND: 'page_ind',
                    TURN_DIR: 'turn_dir'
                }
            }
        }
        const { DATASET } = CONST
        /* 公用 JQ Ele */
        /* 公用 var */
        //  公用變量
        
        //  API
        let api_blog = '/api/blog'
        let api_initImg = '/api/blog/initImgs'
        //  JQ Ele
        let $inp_changeTitle = $(DATASET.ACTION(CONST.CHANGE_TITLE.ACTION))
        let $btn_updateTitle = $(DATASET.ACTION(CONST.UPDATE_TITLE.ACTION))
        let $publicOrHidden = $(DATASET.ACTION(CONST.PUBLIC_OR_HIDDEN.ACTION))
        let $wordCount = $('#wordCount')

        let $$editor
        //  schema
        let htmlStr_minLength = 1
        let htmlStr_maxLength = 65536
        let schema = {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    diff: 'title',
                    minLength: 1,
                    maxLength: 25
                },
                html: {
                    type: 'string',
                    diff: 'html',
                    minLength: htmlStr_minLength,
                    maxLength: htmlStr_maxLength
                },
                show: {
                    type: 'boolean',
                    diff: 'show'
                }
            },
            minProperties: 1
        }

        try {
            //  初始化頁面
            init_pageUI()
            init_pageFuc()
            $('main, nav, main, footer').removeAttr('style')
            $$editor.focus()
        } catch (e) {
            console.log(`init blog-editor.ejs Err =>`, e)
        }

        //  初始化 頁面UI
        function init_pageUI() {
            //  初始化 btn#updateTitle
            $btn_updateTitle.prop('disabled', true)
            //  初始化 input[name=show]
            publicOrHidden.prop('checked', pageData.blog.show)
        }
        //  初始化 頁面各功能
        function init_pageFuc() {
            //  updateBlog 酬載容器
            let payload = init_payload()
            pageData.payload = payload
            //  editor
            $$editor = init_editor()
            backDrop.insertEditors([$$editor])
            window.editor = $$editor
            initImgData()
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
                await _axios.patch(api_blog, {
                    cancelImgs,
                    blog_id: pageData.blog.id,
                    owner_id: pageData.blog.author.id
                })
                //  整理img數據
                cancelImgs.forEach(({
                    blogImgAlt_list
                }) => {
                    blogImgAlt_list.forEach(alt_id => {
                        pageData.blog.map_imgs.delete(alt_id)
                    })
                })
            }
            //  生成 valicator
            let valicator = init_valicator(schema)
            //  $title handleInput => 驗證標題合法性
            $inp_changeTitle.on('input', handle_input)
            //  $title handleBlur => 若標題非法，恢復原標題
            $inp_changeTitle.on('blur', handle_blur)
            //  $btn_updateTitlebtn handleClick => 送出新標題
            $btn_updateTitle.on('click', handle_updateTitle)
            //  $show handleChange => 改變文章的公開狀態
            $publicOrHidden.on('change', handle_changeShow)
            //  $save handleClick => 更新文章
            $('#save').on('click', handle_saveBlog)
            //  btn#remove 綁定 click handle => 刪除 blog
            $('#remove').on('click', handle_removeBlog)

            //  handle
            //  關於 刪除文章的相關操作
            async function handle_removeBlog(e) {
                if (!confirm('真的要刪掉?')) {
                    return
                }
                const { errno } = await _axios.delete(api_blog, {
                    data: {
                        blogList: [pageData.blog.id],
                        owner_id: pageData.blog.author.id
                    }
                })
                if (!errno) {
                    my_alert('已成功刪除此篇文章')
                    location.href = '/self'
                }
            }
            //  關於 更新文章的相關操作
            async function handle_saveBlog(e) {
                //  若當前html沒有內容，則不合法
                if (!payload.get('curHtml')) {
                    alert('沒有內容是要存什麼啦')
                    return
                }
                //  檢查並提取(除了curHtml以外)當前payload數據
                let payloadObj = checkAndGetPayload()
                if (!payloadObj) { //  代表有非法值
                    return
                }
                //  更新完成後，用來與 window.payload 同步數據
                let _payloadObj = {
                    ...payloadObj
                }
                //  取出 要刪除關聯的圖片
                let cancelImgs = getBlogImgIdList_needToRemoveAssociate()
                if (cancelImgs.length) { //  若cancel有值
                    payloadObj.cancelImgs = cancelImgs //  放入payload
                }
                //  若有img，則將其轉換為自定義<x-img>
                if (editor.getElemsByType('image').length) {
                    payloadObj.html = parseImgToXImg(payload.get('html'))
                }
                //  payloadObj 放入 blog_id
                payloadObj.blog_id = pageData.blog.id
                payloadObj.owner_id = pageData.blog.author.id
                const { errno } = await axios.patch(api_blog, payloadObj)
                if (errno) {
                    my_alert('blog save error!')
                    return
                }

                //  若此次有更新title
                if (payloadObj.title) {
                    //  同步頁面數據
                    $inp_changeTitle.val(payloadObj.title)
                    //  關閉title更新鈕
                    $btn_updateTitle.prop('disabled', true)
                }

                //  重置 payload
                payload.reset()
                //  同步 window.blog
                pageData.blog = {
                    ...pageData.blog,
                    ..._payloadObj
                }
                
                if (confirm('儲存成功！是否預覽？（新開視窗）')) {
                    window.open(`/blog/${pageData.blog.id}?preview=true`)
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
                //  檢查並返回當前所有表格數據
                function checkAndGetPayload() {
                    //  複製 payload 內除了 curHtml 以外的所有數據
                    let payloadObj = [...payload.entries()].reduce((initVal, [k, v]) => {
                        if (k !== 'curHtml') {
                            initVal[k] = v
                        }
                        return initVal
                    }, {})
                    //  驗證數據是否都合法
                    let errors = valicator(payloadObj)
                    if (errors.length) { //  代表不合法
                        errors.forEach(({
                            message
                        }) => my_alert(message))
                        return false
                    }
                    //  合法
                    return payloadObj
                }
            }
            //  關於 設定文章公開/隱藏時的操作
            function handle_changeShow(e) {
                let show = e.target.checked
                let errors = valicator({
                    show
                })
                if (!errors.length) { //  代表合法
                    //  存入 payload
                    payload.setKVpairs({
                        show
                    })
                }
                return
            }
            //  關於 更新title 的相關操作
            async function handle_updateTitle(e) {
                let payloadData = {
                    id: pageData.blog.id,
                    title: payload.get('title')
                }
                let { data: blog } = await _axios.patch(api_blog, payloadData)
                //  使 $btn_updateTitle 無法作用
                e.target.disabled = true
                //  同步數據
                pageData.blog.title = blog.title
                payload.delete('title')
                my_alert('標題更新完成')
            }
            //  關於 title 輸入新值後，又沒立即更新的相關操作
            function handle_blur(e) {
                let $el = $(e.target)
                let value = $el.val().trim()
                //  如果標題不變，或是沒有值
                if (value === pageData.blog.title || !value) {
                    //  移除非法提醒
                    $el.removeClass('is-invalid')
                    //  恢復原標題
                    $el.val(pageData.blog.title)
                }
                return
            }
            //  關於 title 輸入新值時的相關操作
            function handle_input(e) {
                let title = my_xss(e.target.value.trim())
                let [error] = valicator({
                    title
                })
                if (!error) { //  代表合法
                    //  存入 payload
                    payload.setKVpairs({
                        title
                    })
                    //  移除非法提醒
                    $(e.target).removeClass('is-invalid')
                    //  $btn_updateTitle 可作用
                    $btn_updateTitle.prop('disabled', false)
                    return
                }
                //  $btn_updateTitle 不可作用
                $btn_updateTitle.prop('disabled', true)
                //  顯示非法提醒
                $(e.target).addClass('is-invalid').next().addClass('invalid-feedback').text(error.message)
            }

            //  init函數
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
                        let curData = pageData.blog[inputName]
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
                            payload.delete(inputName)
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
            // 初始化 編輯文章頁 的功能
            function init_editor() {
                let api_img = '/api/blog/img'
                let api_createBlogImgAlt = '/api/blog/blogImgAlt'
                //  editor 的 繁中設定
                wangEditor.i18nAddResources('tw', {
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
                wangEditor.i18nChangeLanguage('tw')
                //  editor config
                const editorConfig = {
                    readOnly: true,
                    placeholder: '請開始撰寫文章內容...',
                    //  每次editor焦點/內容變動時調用
                    onChange: handle_change(),
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
                    html: pageData.blog.html || '',
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
                return editor
                //  editor 的 修改圖片資訊前的檢查函數
                async function checkImage(src, alt, url) {
                    //  修改
                    let reg = /alt_id=(?<alt_id>\w+)/
                    let res = reg.exec(src)
                    let alt_id = res.groups.alt_id * 1
                    let blog_id = pageData.blog.id
                    alt = my_xss(alt)
                    await _axios.patch('/api/album', { blog_id, alt_id, alt })
                    //  尋找相同 alt_id
                    let imgData = pageData.blog.map_imgs.get(alt_id)
                    imgData.alt = alt
                    return true
                }
                //  editor的 自定義上傳圖片方法
                async function customUpload(img, insertFn) {
                    let nameAndExt = getNameAndExt(img.name)
                    let {
                        name,
                        ext
                    } = nameAndExt
                    name = name.trim().toUpperCase()
                    ext = ext.trim().toUpperCase()
                    if (ext !== 'PNG' && ext !== 'JPG') {
                        alert('只能提供png與jpg的圖檔類型')
                        return
                    }
                    //  生成 img 的 hash(hex格式)
                    let {
                        exist,
                        blogImg_id,
                        hash
                    } = await _getHash(img)
                    let res
                    if (!exist) { // img為新圖，傳給後端建檔
                        console.log('進行新圖處理')
                        //  imgName要作為query參數傳送，必須先作百分比編碼
                        name = encodeURIComponent(name)
                        let api = `${api_img}?hash=${hash}&name=${name}&ext=${ext}&blog_id=${pageData.blog.id}`
                        //  創建 formData，作為酬載數據的容器
                        let formdata = new FormData()
                        //  放入圖片數據
                        formdata.append('blogImg', img)
                        //  upload
                        res = await _axios.post(api, formdata)
                    } else { // img為重覆的舊圖，傳給後端新建一個blogImgAlt
                        console.log('進行舊圖處理')
                        res = await _axios.post(api_createBlogImgAlt, {
                            blogImg_id
                        })
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
                    //  同步數據
                    pageData.blog.map_imgs.set(newImg.alt_id, newImg)
                    //  將圖片插入 editor
                    insertFn(`${newImg.url}?alt_id=${newImg.alt_id}`, newImg.name)
                    //  取得圖片的 hash
                    async function _getHash(img) {
                        //  取得 img 的 MD5 Hash(hex格式)
                        let hash = await _getMD5Hash(img)
                        let res = {
                            exist: false,
                            blogImg_id: undefined,
                            hash
                        }
                        let {
                            map_imgs
                        } = pageData.blog
                        if (map_imgs.size) {
                            //  利用hash，確認此時要上傳的img是否為舊圖
                            let imgs = [...map_imgs.values()]
                            //  img { alt_id, alt, blogImg_id, name, img_id, hash, url }
                            for (let img of imgs) {
                                if (img.hash === hash) {
                                    res.blogImg_id = img.blogImg_id
                                    res.exist = true
                                    break
                                }
                            }
                        }
                        return res
                        //  計算 file 的 MD5 Hash
                        function _getMD5Hash(file) {
                            return new Promise((resolve, reject) => {
                                let fr = new FileReader()
                                fr.addEventListener('load', (evt) => {
                                    if (fr.readyState === FileReader.DONE) {
                                        let hash = SparkMD5.ArrayBuffer.hash(fr.result)
                                        resolve(hash)
                                    }
                                })
                                fr.addEventListener('error', (error) => {
                                    reject(error)
                                })
                                fr.readAsArrayBuffer(file)
                            })
                        }
                    }

                    function getNameAndExt(imgName) {
                        let reg = /^(.+)\.(.+?)$/
                        let [_, name, ext] = reg.exec(imgName)
                        return {
                            name,
                            ext
                        }
                    }
                }
                //  handle：editor選區改變、內容改變時觸發
                function handle_change() {
                    //  因為 editor 是 autoFocus，故handle_change 一開始便會被調用，也利用這點先為 payload 設置 html數據
                    let init = true
                    return (editor) => {
                        //  xss & 移除頭尾空行
                        let html = xssAndRemoveEmpty(editor.getHtml())
                        //  初始化 payload.curHtml
                        if (init) {
                            payload.set('curHtml', html)
                            $wordCount.text(`還能輸入${htmlStr_maxLength - payload.get('curHtml').length}個字`)
                            init = false
                            return
                        }
                        //  僅是 editor 獲得/失去焦點
                        if (html === payload.get('curHtml')) {
                            return
                        }
                        //  驗證htmlStr
                        let errors = valicator({
                            html
                        })
                        payload.setKVpairs({
                            curHtml: html
                        })
                        if (errors.length) { //  非法
                            let [{
                                keyword
                            }] = errors
                            console.log('keyword => ', keyword, errors, htmlStr_maxLength, html.length)
                            if (keyword === 'minLength') {
                                $wordCount.text(`還能輸入${htmlStr_maxLength}個字`)
                            } else if (keyword === 'maxLength') {
                                $wordCount.text(`已經超過${html.length - htmlStr_maxLength}可輸入字數`)
                            } else if (keyword === 'diff') {
                                $wordCount.text(`還能輸入${htmlStr_maxLength - html.length}個字`)
                            }
                            return
                        }
                        console.log('OK', htmlStr_maxLength, html.length)
                        $wordCount.text(`還能輸入${htmlStr_maxLength - html.length}個字`)
                        payload.setKVpairs({
                            html
                        })
                    }
                    //  去除空格與進行xss
                    function xssAndRemoveEmpty(data) {
                        //  xss
                        let curHtml = my_xss(data.trim())
                        //  移除開頭、結尾的空格與空行
                        let reg_start = /^((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*/g
                        let reg_end = /((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*$/g
                        curHtml = curHtml.replace(reg_start, '')
                        curHtml = curHtml.replace(reg_end, '')
                        return curHtml
                    }
                }
            }
            //  初始化 payload
            function init_payload() {
                let payload = new Map()
                payload.setKVpairs = setKVpairs
                payload.reset = reset
                return payload

                function setKVpairs(dataObj) {
                    //  將kv資料存入
                    if (dataObj) {
                        let kv = [...Object.entries(dataObj)].forEach(([key, val]) => payload.set(key, val))
                    }
                }

                function reset() {
                    let curHtml = payload.get('curHtml')
                    payload.clear()
                    payload.set('curHtml', curHtml)
                }
            }
            /*  取出要移除的 blogImgAlt_id  */
            function getBlogImgIdList_needToRemoveAssociate() {
                let reg = /alt_id=(?<alt_id>\w+)/
                //  複製一份 blogImgAlt
                let map_imgs_needRemove = new Map([...pageData.blog.map_imgs])
                //  找出[{src, alt, href}, ...]
                editor.getElemsByType('image').forEach(({
                    src
                }) => {
                    let res = reg.exec(src)
                    if (!res && !res.groups.alt_id) {
                        return
                    }
                    let alt_id = res.groups.alt_id * 1
                    //  map_imgs_needRemove 刪去 從 editor 找到的 img 資料，剩下的便是要請求後端刪除的 img 數據
                    map_imgs_needRemove.delete(alt_id)
                    return
                })
                let cancelImgs = []

                if (map_imgs_needRemove.size) {
                    map_imgs_needRemove.forEach(({
                        blogImg_id
                    }, alt_id) => {
                        let ok = cancelImgs.some((img, index) => {
                            if (img.blogImg_id === blogImg_id) { //  若存在，則將當前片alt_id直接收入blogImgAlt_list
                                cancelImgs[index]['blogImgAlt_list'].push(alt_id)
                                return true
                            }
                        })
                        if (!ok) { //  不存在，將當前整理的圖片整筆記錄下來
                            cancelImgs.push({
                                blogImg_id,
                                blogImgAlt_list: [alt_id]
                            })
                        }
                    })
                }
                console.log('@要刪除的img,整理結果 => ', cancelImgs)
                return cancelImgs
            }
        }

        //  utils ------
        //  表格內容xss
        function my_xss(html) {
            return xss(html, {
                whiteList: {
                    ...xss.whiteList,
                    div: ['data-w-e-type'],
                    input: ['type'],
                    img: ['src', 'alt', 'style', 'data-href']
                },
                //  若ele的tag與attr符合白名單，會進入此過濾函數
                onTagAttr(tag, attr, attrVal, isW) {
                    let checkbbox = tag === 'input' && attr === 'type' && attrVal === 'checkbox'
                    let todoDiv = tag === 'div' && attr === 'data-w-e-type' && attrVal === 'todo'
                    let img = tag === 'img' && attr === 'src' || attr === 'alt' || attr === 'style' || attr === 'data-href'
                    if (checkbbox || todoDiv || img) {
                        //  返回的字符串會成為ele的attr與attrVal
                        return `${attr}="${attrVal}"`
                    }
                },
                //  若ele的tag不符合白名單，會進入此過濾函數
                onIgnoreTag(tag, htmlStr) {
                    if (tag === 'x-img') {
                        return htmlStr
                    }
                }
            })
        }
        //  配合loadEnd發生的alert，作異步處理
        function my_alert(msg) {
            setTimeout(() => {
                alert(msg)
            }, 10)
        }
    }

})