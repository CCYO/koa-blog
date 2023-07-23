console.log('@_axios loading.....')
import axios from 'axios'
import { genLoadingBackDrop } from './commonUI'
import * as ErrRes from '../../../server/model/errRes'

// let { loading, loadEnd } = genBackdrop()
const backdrop = new genLoadingBackDrop()
// let loadEnd = pageLoading.hide
// let loading = pageLoading.show
/* 配置 axios 的 請求攔截器，統一處理報錯 */
axios.interceptors.request.use(
    (config) => {
        let { blockPage = false } = config
        backdrop.show(blockPage)
        return config
    },
    error => { throw error }
)
/* 配置 axios 的 響應攔截器，統一處理報錯 */
axios.interceptors.response.use(
    response => {
        let { config: { url }, data: { errno, data, msg } } = response
        let res = response.data
        if (errno === ErrRes.PERMISSION.NO_LOGIN.errno) {
            res = { errno, data: { me: {} } }
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
    console.log('@_axios error => ', error)
    let { data: { errno, msg } } = error.response
    let redir
    if (errno === ErrRes.PERMISSION.NO_LOGIN.errno) {
        redir = `/login?from=${encodeURIComponent(location.href)}`
    } else {
        redir = `/errPage?errno=${encodeURIComponent(errno)}&msg=${encodeURIComponent(msg)}`
    }
    alert(msg)
    location.href = redir
    return Promise.reject()
}

export default axios