//  未完成
if (process.env.NODE_ENV === 'development') {
    require('../views/albumList.ejs')
}
import '../css/albumList.css'

import UI from './utils/ui'

import InitPage from './utils/InitPage.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './wedgets/navbar.js'
//  初始化 Navbar
import initEJSData from './utils/initEJSData.js'
//  初始化來自ejs在頁面上的字符數據
import LoadingBackdrop from './wedgets/LoadingBackdrop'
window.addEventListener('load', async () => {
    const backDrop = new LoadingBackdrop()
    try {
        backDrop.show({ blockPage: true })
        //  讀取中，遮蔽畫面
        let initPage = new InitPage()
        await initPage.addOtherInitFn(initEJSData)
        //  初始化ejs
        await initPage.addOtherInitFn(initNavbar)
        //  初始化navbar
        await initPage.render()
        //  統整頁面數據，並渲染需要用到統整數據的頁面內容
        backDrop.hidden()
        //  讀取完成，解除遮蔽
        $('main, nav, main, footer').removeAttr('style')
    } catch (error) {
        throw error
        // location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }
})