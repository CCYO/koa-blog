import axios from 'axios'
import LoadingBackdrop from './wedgets/LoadingBackdrop'
import * as ErrRes from '../../../server/model/errRes'

const backdrop = new LoadingBackdrop()
const instance = axios.create()
//  創建一個axios實例
/* 配置 axios 的 請求攔截器，統一處理報錯 */
instance.interceptors.request.use(
    (config) => {
        const backdropConfig = {
            blockPage: config && config.hasOwnProperty('blockPage') ? config.blockPage : false,
            editors: config && config.hasOwnProperty('editors') ? config.editors : []
        }
        //  當 axios 調用請求方法時，依據傳入的config取得backdrop的options
        backdrop.show(backdropConfig)
        //  顯示遮罩
        return config
    },
    error => { throw error }
)
/* 配置 axios 的 響應攔截器，統一處理報錯 */
instance.interceptors.response.use(
    response => {
        let { config: { url }, data: { errno } } = response
        let res = response.data
        if (errno === ErrRes.PERMISSION.NO_LOGIN.errno) {
            //  響應未登入
            const reg = /^\/api\/news$/
            let isNews = reg.test(window.location.pathname)
            if(isNews){
                //  若是 getNews 請求的回應處理
                console.log('取得news資訊時，發現未登入')
                res = { errno, data: { me: {} } }
            }else{
                //  非 getNews 請求的回應處理
                alert('尚未登入！請先登入帳號！')
                location.href = `/login?from=${encodeURIComponent(location.href)}`
            }
        }
        backdrop.hidden()
        return Promise.resolve(res)
    },
    error => {
        /* axios 結果一律以 resolve 方式處理，響應都會是 { errno, data || msg } 方式呈現*/
        return errHandle(error)
    }
)
function errHandle(error) {
    //  response.status 4xx以上的響應
    console.log('@_axios error => ', error)
    let { data: { errno, msg } } = error.response
    let redir
    if (errno === ErrRes.PERMISSION.NO_LOGIN.errno) {
        //  針對未登入的錯誤處理
        redir = `/login?from=${encodeURIComponent(location.href)}`
    } else {
        //  針對未登入以外的錯誤處理
        redir = `/errPage?errno=${encodeURIComponent(errno)}&msg=${encodeURIComponent(msg)}`
    }
    alert(msg)
    location.href = redir
    return Promise.reject()
}

export default instance