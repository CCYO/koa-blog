console.log('@genDebounce loading...')
const CONF = {
    ms: 250,
    auto: false,
    loading: undefined
}

/* 防抖動 的 工廠函數  */
export default function(fn, config = CONF) {
    /* 防抖動的函數工廠 */
    let {
        ms = CONF.ms,
        auto = CONF.auto,
        loading = CONF.loading
    } = config
    let timeSet
    //  setTimeout 標記
    let debounce = (...args) => {
        if(loading){
            console.log('@...args => ', args)
            loading.call(this, ...args)
        }
        if (timeSet) {
            /* 取消上一次的 setTimeout */
            clearTimeout(timeSet)
        }
        timeSet = setTimeout(async function () {
            /* 延遲調用fn，且調用完畢後自動再作一次延遲調用 */
            await fn.call(this, ...args)
            if (auto) {
                debounce(fn, ms)
            }
        }, ms)
    }
    return debounce
}