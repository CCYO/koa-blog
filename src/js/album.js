//  未完成
if (process.env.NODE_ENV === 'development') {
    require('../views/album.ejs')
}
import '../css/album.css'
// 引入 editor css
import { createEditor } from '@wangeditor/editor'
// 引入 editor js

import _xss, { xssAndRemoveHTMLEmpty, xssAndTrim } from './utils/_xss'
import validates from './utils/validate'
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
})
async function renderPage(data) {
    //  初始化頁面功能
    //  公用變量
    let pageData = data
    // ----------------------------------------------------------------------------------------
    window.pageData = pageData
    // ----------------------------------------------------------------------------------------
    let { blog, imgs, map_imgs } = data.album
    let { id: owner_id } = pageData.me
    //  handle ---
    //  照片名稱span，handle click => 顯示、聚焦改名表格
    $('p.card-text').click(showAndFocusChangeImgAlt)
    //  照片改名表格，handle focus => 游標定位在表格最末位，確認可否更新
    $(`.inputCardName`).on('focus', focusChangeImgAlt)
    //  照片改名表格，handle input => 確認可否更新
    $(`.inputCardName`).on('input', (e) => {
        //  確認照片名稱是否為新
        toggleUpdateBtn($(e.target))
    })
    //  照片改名表格，handle blur => 確認是否放棄更新
    $(`.inputCardName`).on('blur', cancelChangeImgAlt)
    //  照片名稱更新鈕，handle click => 送出請求
    $(`[data-my-photo] button`).on('click', updateImgAlt)
    //  handle -----
    //  請求更新imgAlt
    async function updateImgAlt(e) {
        let $btn
        let $container
        if(e instanceof Event ){
            $btn = $(e.target)
            $container = $btn.parents('[data-my-photo]')
        }else if(e instanceof $){
            $container = e
        }else{
            $btn = $(e)
        }
        let alt = $btn.prev().val()
        let alt_id = $container.attr('data-my-photo') * 1
        let payload = { alt_id, alt, blog_id: blog.id }
        // 發出請求
        await _axios.patch('/api/album', payload)
        //  同步頁面數據
        let img = map_imgs.get(alt_id)
        img.alt = alt
        //  同步畫面
        $container.children('img').attr('alt', alt)
        $container.find('.card-text').text(alt).toggle()
        $container.find('.card-body > div').removeClass('d-flex')
        $container.find('input[type=text]').val(alt)
    }
    //  確認是否放棄更新
    async function cancelChangeImgAlt(e) {
        let $el = $(e.target)
        let $container = $el.parents('[data-my-photo]')
        let blogImgAlt_id = $container.attr('data-my-photo') * 1
        let { alt } = map_imgs.get(blogImgAlt_id)
        if (alt === $el.val().trim()) {
            // $el.parent().removeClass('d-flex invalide')
            // $el.parent().toggle()
            cancel()
            return
        }
        if (confirm('是否變更照片名稱？')) {
            await updateImgAlt($container)
            // $el.val(alt)
            // await _axios.patch('/api/album', payload)
            // //  同步頁面數據
            // let img = map_imgs.get(alt_id)
            // img.alt = alt
            // //  同步畫面
            // $container.children('img').attr('alt', alt)
            // $container.find('.card-text').text(alt).toggle()
            // $container.find('.card-body > div').removeClass('d-flex')
            // $container.find('input[type=text]').val(alt)
        } else {
            cancel()
        }
        return


        function cancel() {
            console.log('取消更新')
            $container.find('.card-text').toggle()
            $container.find('.d-flex').toggleClass('d-flex')
            return
        }
    }
    //  游標定位在表格最末位，確認可否更新
    function focusChangeImgAlt(e) {
        setTimeout(() => {
            let $el = $(e.target)
            $el[0].selectionStart = $el.val().length
            //  確認照片名稱是否為新
            toggleUpdateBtn($el)
        }, 0)
    }
    //  顯示、聚焦改名表格
    function showAndFocusChangeImgAlt(e) {
        let $cardText = $(e.target)
        let $container = $cardText.parents('[data-my-photo]')
        $cardText.toggle().next().addClass('d-flex').children('.inputCardName').focus()
    }
    //  utils -----
    //  確認照片名稱是否為新，已辨別是否能夠點擊更新鈕
    function toggleUpdateBtn($el) {
        let alt_id = $el.parents('[data-my-photo]').attr('data-my-photo') * 1
        let $btn = $el.next()
        let { alt } = map_imgs.get(alt_id)
        let ok = $el.val().trim() !== alt
        $btn.prop('disabled', !ok)
        return ok
    }
}

