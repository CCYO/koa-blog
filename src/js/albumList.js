//  未完成
if (process.env.NODE_ENV === 'development') {
    require('../views/albumList.ejs')
}
import '../css/albumList.css'

import InitPage from './utils/wedgets/InitPage.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './utils/wedgets/navbar.js'
//  初始化 Navbar
import initEJSData from './utils/wedgets/initEJSData.js'
//  初始化 ejs 存放在頁面上的數據
import LoadingBackdrop  from './utils/wedgets/LoadingBackdrop'
//  讀取遮罩

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
        $('main, nav, main, footer').removeAttr('style')
        backDrop.hidden()
        //  讀取完成，解除遮蔽
    } catch (error) {
        throw error
        // location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }
})