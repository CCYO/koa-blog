/* -------------------- EJS MODULE -------------------- */
if (process.env.NODE_ENV === 'development') {
    require('../views/register&login.ejs')
}
/* -------------------- CSS MODULE -------------------- */
import '../css/register&login.css'
/* -------------------- Utils MODULE -------------------- */
import { feedback } from './utils/ui'
import Debounce from './utils/Debounce'
import validate from './utils/validate/validate.js'
import _axios from './utils/_axios'
/* -------------------- Utils MODULE FOR Wedgets -------------------- */
import InitPage from './utils/wedgets/InitPage.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './utils/wedgets/navbar.js'
//  初始化 Navbar
import LoadingBackdrop from './utils/wedgets/LoadingBackdrop'
//  讀取遮罩
/* -------------------- RUN -------------------- */
const backdrop = new LoadingBackdrop()
window.addEventListener('load', async () => {
    try {
        backdrop.show({ blockPage: true })
        //  讀取中，遮蔽畫面
        let initPage = new InitPage()
        //  幫助頁面初始化的統整函數
        await initPage.addOtherInitFn(initNavbar)
        //  初始化navbar
        await initPage.render(renderPage)
        $('main, nav, main, footer').removeAttr('style')
        //  統整頁面數據，並渲染需要用到統整數據的頁面內容
        backdrop.hidden()
        //  讀取完成，解除遮蔽
    } catch (error) {
        throw error
        // location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
    }

    function renderPage() {
        /* -------------------- CONST -------------------- */
        const CONST = {
            IS_EMAIL_EXIST: {
                ACTION: 'email'
            },
            REGISTER: {
                ACTION: 'register',
                get API() { return `/api/user/${this.ACTION}` }
            },
            LOGIN: {
                ACTION: 'login',
                get API() { return `/api/user` }
            },
            SELECTOR: {
                FORM: (action) => `#${action}-form`,
                CARD: (action) => `#${action}-card`,
                EMAIL: '[name=email]'
            }
        }
        /* -------------------- PUBLIC VAR -------------------- */
        let $$validate = validate
        let $$payload = {
            login: {},
            register: {}
        }
        deb_eventHandle(`${CONST.SELECTOR.FORM(CONST.REGISTER.ACTION)} ${CONST.SELECTOR.EMAIL}`, 'input', handle_isEmailExist)
        document.querySelector(CONST.SELECTOR.FORM(CONST.REGISTER.ACTION)).addEventListener('submit', handle_form(CONST.REGISTER.ACTION))
        document.querySelector(CONST.SELECTOR.FORM(CONST.LOGIN.ACTION)).addEventListener('submit', handle_form(CONST.LOGIN.ACTION))

        async function handle_isEmailExist(e) {
            let formType = CONST.REGISTER.ACTION
            let action = CONST.IS_EMAIL_EXIST.ACTION
            let email_inp = e.target
            let datas = $$payload[formType]
            datas.email = email_inp.value
            let validate = $$validate[action]
            let validateRes = await validate(datas)
            if (validateRes) {
                let msg = validateRes[action]
                feedback(2, email_inp, false, msg)
                return
            }
            feedback(2, email_inp, true, '')
            email_inp.focus()
        }
        function handle_form(action) {
            return async function _(e) {
                e.preventDefault()
                const isInputEvent = e.type === 'input'
                let ACTION = action.toLocaleUpperCase()
                let ele = e.target
                let form = document.querySelector(CONST.SELECTOR.FORM(action))
                //  取得 formType
                let datas = $$payload[action]
                let invalidInps = []
                //  存放無效值的inp
                let validInps = []
                //  存放有效值的inp
                let validate = $$validate[action]
                if (isInputEvent) {
                    /* input 代表是由 input 觸發*/
                    datas[ele.name] = ele.value
                    //  更新$$datas內的表格數據
                } else {
                    /* submit 代表是由 form 觸發，蒐集表單數據*/
                    for (let inp of form) {
                        if (inp.type === 'submit' || (action === CONST.REGISTER.ACTION && inp.name === 'email')) {
                            /* submit沒資料，email則有獨立handle*/
                            continue
                        }
                        datas[inp.name] = inp.value
                        //  將表格數據存入$$datas
                    }
                }
                let validateErrs = await validate(datas)
                //  驗證
                if (isInputEvent) {
                    /* 整理此次 input 影響的錯誤提醒，以及表格的綁定事件 */
                    for (let inp of form) {
                        let inputName = inp.name
                        if (e.type === 'submit' || (action === CONST.REGISTER.ACTION && inputName === 'email')) {
                            /* 除了email，其有獨立的 handle*/
                            continue
                        }
                        if (!validateErrs || !validateErrs[inputName]) {
                            /* datas 整體有效 || datas[inpName] 當前屬性數據有效 */
                            validInps.push(inp)
                        } else if (validateErrs[inputName]) {
                            invalidInps.push({ inp, msg: validateErrs[inputName] })
                        }
                    }
                } else if (validateErrs) {
                    /* 若EventType不是input，且驗證結果有錯誤 */
                    let inputNames = [...form].filter(inp => {
                        return inp.type !== 'submit' && !(action === CONST.REGISTER.ACTION && inp.name === 'email')
                        //  撇除 email 與 submit
                    }).map(inp => inp.name)
                    //  僅取出 inputName
                    let set_validInpName = new Set(inputNames)
                    //  用來過濾出含有效值的inpName
                    for (let inputName in validateErrs) {
                        set_validInpName.delete(inputName)
                        //  刪去無效值的inpName
                        let inp = $(form).find(`input[name=${inputName}]`)[0]
                        invalidInps.push({ inp, msg: validateErrs[inputName] })
                    }
                    for (let inpName of set_validInpName) {
                        /* 針對通過驗證的 inpName 進行處理*/
                        let inp = $(form).find(`input[name=${inpName}]`)[0]
                        validInps.push(inp)
                    }
                } else {
                    /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
                    const api = CONST[ACTION].API
                    let { errno, msg } = await _axios.post(api, datas)
                    if (!errno) {
                        if (action === CONST.LOGIN.ACTION) {
                            alert('登入成功')
                            let from = location.search ? new URLSearchParams(location.search).get('from') : false
                            location.href = from ? from : '/self'
                        } else {
                            alert('註冊成功，請嘗試登入')
                            location.pathname = '/login'
                        }
                    } else {
                        alert(msg)
                        datas = {}
                        feedback(4, form)
                    }
                    return
                }
                for (let inp of validInps) {
                    feedback(2, inp, true, '')
                }
                for (let { inp, msg } of invalidInps) {
                    feedback(2, inp, false, msg)
                    !inp.has_debHandle && deb_eventHandle(inp, 'input', _)
                    //  未標記 has_debHandle，則綁定
                }
                return
            }
        }

        function deb_eventHandle(selectorOrEl, eventType, handle) {
            let ele = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl
            if (ele.has_debHandle) {
                return
            }
            ele.has_debHandle = true
            const deb_handle = new Debounce(handle, {
                loading: (e) => feedback(1, e.target)
            })
            ele.addEventListener(eventType, (e) => deb_handle.call(e))
        }
    }
})