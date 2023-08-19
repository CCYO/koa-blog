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
const { genLoadingBackdrop } = UI
const backDrop = new genLoadingBackdrop()
const validate = window.validate = validates['alt']
//  初始化來自ejs在頁面上的字符數據
window.addEventListener('load', async () => {

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
    const $modal = $('#modalBackdrop').first()
    let $$bs5_modal = new bootstrap.Modal($modal)
    //  生成BS5 Modal
    $('card button').click(e => {
        const $container = $(e.target).parents('card').first()
        $$bs5_modal.show($container)
    })
    $modal[0].addEventListener('show.bs.modal', function (e) {
        const $container = e.relatedTarget
        //  觸發 modal show的元素
        let alt_id = $container.data('myPhoto')
        alt_id *= 1
        const { alt } = pageData.album.map_imgs.get(alt_id)
        $(e.target).data('myPhoto', alt_id)
        //  使 modal 的 dataset 呈現 alt_id
        console.log('@@@ => ', $(e.target).find('input').first())
        $(e.target).find('input').first().val(alt)
        //  使 modal 的 input 呈現當前照片名稱
    })
    $modal.on('shown.bs.modal', (e) => {
        $('e.target').find('input').get(0).focus()
        //  當 modal 顯示時，自動聚焦在 input 上
    })
    $modal.find('.modal-footer > button:last-child').on('click', async (e) => {
        const alt_id = $modal.data('myPhoto')
        const $inp = $modal.find('.modal-body').first().children('input').first()
        const alt = xssAndTrim($inp.val())
        const $$alt = pageData.album.map_imgs.get(alt_id).alt
        const payload = { alt_id, alt, blog_id: blog.id }
        const validateData = { ...payload, $$alt }
        //  驗證
        let errors = await validate(validateData)
        if (errors) {
            let res = Object.entries(errors).reduce((msg, [key, kvPairs]) => {
                if (key === 'alt') {
                    key = '相片名稱'
                }
                let m = Object.entries(kvPairs).reduce((acc, [k, v], ind) => {
                    if (ind > 0) {
                        acc += ','
                    }
                    console.log('xx =?> ', acc, ind, v)
                    return acc += v
                }, '')
                msg += `${key}${m}`
                return msg
            }, '')
            alert(res)
            return
        }
        await _axios.patch('/api/album', payload)
        // 發出請求
        map_imgs.get(alt_id).alt = alt
        const $card = $(`.card[data-my-photo=${alt_id}]`).first()
        $card.find('.card-text').first().text(alt)
        $card.find('img').first().attr('alt', alt)
        //  同步頁面數據
        $inp.val()
        $modal.data('myPhoto', '')
        //  重置 modal
        $$bs5_modal.hide()
        //  關閉 modal
    })
    $modal.find('.modal-footer > button:first-child').on('click', async (e) => {
        const $target = $(e.target)
        const $p = $modal.find('.modal-body').first().children('input').first().val()
        $modal.data('myPhoto', '')
        //  重置 modal
    })
    //  游標定位在表格最末位，確認可否更新
    function focusChangeImgAlt(e) {
        setTimeout(() => {
            let $el = $(e.target)
            $el[0].selectionStart = $el.val().length
            //  確認照片名稱是否為新
            toggleUpdateBtn($el)
        }, 0)
    }
}

