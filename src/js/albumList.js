//  未完成
if (process.env.NODE_ENV === 'development') {
    require('../views/albumList.ejs')
}
import '../css/alb.css'
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

})
//  初始化來自ejs傳入當前頁面所需的數據
import initPageFn from '/js/initData.js'
//  logout功能 + 完整渲染 NAV + 取得news + 完整渲染 通知下拉選單
import initNavbar from '/js/navbar.js'
try {
    //  讀取中，遮蔽畫面
    loading()
    //  初始化ejs附帶的數據
    let initPage = new initPageFn()
    //  初始化navbar數據
    await initPage.addOtherInitFn(initNavbar)
    await initPage.render()
    //  讀取完成，解除遮蔽
    loadEnd()
} catch (e) {
    console.log('@page error => ', e)
}

//  utils ------
//  讀取畫面，遮蔽效果
function loading() {
    $('#backdrop').addClass('my-show')
    $('input').attr('disabled', true)
}
//  讀取完成，取消遮蔽
function loadEnd() {
    $('#backdrop').removeClass('my-show')
    $('input').removeAttr('disabled')
}
