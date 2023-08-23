const CONF = {
    ms: 250,
    auto: false,
    loading: undefined
}

export default class {
    /* 防抖動的函數工廠 */
    constructor(fn, config = CONF) {
        this.fn = fn
        this.ms = config.ms ? config.ms : CONF.ms
        this.auto = config.auto ? config.auto : CONF.auto
        this.loading = config.loading ? config.loading : CONF.loading
    }
    timeSet = undefined
    //  setTimeout 標記
    call() {
        const _arguments = arguments
        //  args 是傳給 fn 的參數
        if(this.timeSet){
            clearTimeout(this.timeSet)
        }else if (this.loading) {
        //  例如fn若是EventHandle，則代表可藉由args[0]取得event
            this.loading(..._arguments)
        }
        /* 取消上一次的 setTimeout */
        this.timeSet = setTimeout(async () => {
            /* 延遲調用fn，且調用完畢後自動再作一次延遲調用 */
            await this.fn(..._arguments)
            this.timeSet = undefined
            //  清除timeSet，讓下一次loading順利調用
            if (this.auto) {
                this.call(..._arguments)
            }
        } , this.ms)
    }
}
/* 防抖動 的 工廠函數  */
// export default function (fn, config = CONF) {
//     /* 防抖動的函數工廠 */
//     let {
//         ms = CONF.ms,
//         auto = CONF.auto,
//         loading = CONF.loading
//     } = config
//     let timeSet
//     //  setTimeout 標記
//     let debounce = (...args) => {
//         //  args 是傳給 fn 的參數
//         //  例如fn若是EventHandle，則代表可藉由args[0]取得event
//         if (timeSet) {
//             console.log('@debounce......clear...........')
//             /* 取消上一次的 setTimeout */
//             clearTimeout(timeSet)
//         } else if (loading) {
//             console.log('@debounce......loading.........')
//             loading.call(this, ...args)
//         }
//         timeSet = setTimeout(async function () {
//             console.log('@debounce......call...........', this, args)
//             /* 延遲調用fn，且調用完畢後自動再作一次延遲調用 */
//             await fn.call(this, ...args)
//             if (auto) {
//                 console.log('@debounce......auto + 1')
//                 debounce(fn, ms)
//             }
//             timeSet = undefined
//         }, ms)
//     }
//     return debounce
// }