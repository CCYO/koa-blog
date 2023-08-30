/* -------------------- EJS MODULE -------------------- */
if (process.env.NODE_ENV === 'development') {
    require('../views/register&login.ejs')
}
/* -------------------- CSS MODULE -------------------- */
import '../css/register&login.css'
/* -------------------- Utils MODULE -------------------- */
import { feedback } from './utils/ui'
import Debounce from './utils/Debounce'
import $$module_Validate from './utils/validate/index.js'

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
                INPUTS: ['email', 'password', 'password_again'],
                get API() { return `/api/user/${this.ACTION}` }
            },
            LOGIN: {
                ACTION: 'login',
                INPUTS: ['email', 'password'],
                get API() { return `/api/user` }
            },
            SELECTOR: {
                FORM: (action) => `#${action}-form`,
                CARD: (action) => `#${action}-card`,
                EMAIL: '[name=email]'
            }
        }
        /* -------------------- PUBLIC VAR -------------------- */
        let $$payload = {
            login: {},
            register: {}
        }
        const lock = {
            [CONST.REGISTER.ACTION]: []
        }
        $('form button[type=submit]').prop('disabled', true)
        initRegistFn()
        initLoginFn()
        function initLoginFn() {
            const api_login = CONST.LOGIN.API
            const redir_query = 'from'
            const success_redir = location.search ? new URLSearchParams(location.search).get(redir_query) : '/self'
            const success_alert = '登入成功'
            const inputs = ['email', 'password']
            let formFeedback = genFormFeedback(CONST.LOGIN.ACTION, inputs)
            let formType = CONST.LOGIN.ACTION
            let formId = CONST.SELECTOR.FORM(CONST.LOGIN.ACTION)
            let form = document.querySelector(formId)
            let $submit = $(`${formId} button[type=submit]`).eq(0)
            let payload = $$payload[formType]
            let validate_login = $$module_Validate['login']

            form.addEventListener('input', handle_input_login)
            form.addEventListener('submit', handle_submit_login)

            async function handle_submit_login(e) {
                e.preventDefault()
                let validateErrs = await validate_login(payload)
                //  校驗
                if (validateErrs) {
                    _handle_validateLoginErrors(validateErrs)
                    return
                }
                return
                //  處理校驗錯誤
                /* 送出請求 */
                /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
                let { errno } = await _axios.post(api_login, payload)
                if (!errno) {
                    alert(success_alert)
                    location.pathname = success_redir
                }
                return
            }
            async function handle_input_login(e) {
                e.preventDefault()
                //  LOGIN
                let targetInput = e.target
                let targetInputName = targetInput.name
                let targetInputValue = targetInput.value
                //  指向$$payload裡對應的數據對象
                payload[targetInputName] = targetInputValue
                //  更新payload內的表格數據
                let validateErrs = await validate_login(payload)
                // _handle_validateLoginErrors(validateErrs)
                _handle_validateInputErrors(validateErrs, formId, ['email', 'password'], formFeedback)
                return
            }
            /* 處理校驗錯誤 ..............*/
            function _handle_validateLoginErrors(validateErrs) {
                let invalidInputs = []
                //  存放無效值的inp
                let validInputs = []
                //  存放有效值的inp
                let set_validInpNames = new Set([...CONST.LOGIN.INPUTS])
                //  用來過濾出含有效值的inpName
                for (let invalidInputName in validateErrs) {
                    if (set_validInpNames.has(invalidInputName)) {
                        set_validInpNames.delete(invalidInputName)
                        //  刪去無效值的inpName
                        let input = $(`${formId} input[name=${invalidInputName}]`).get(0)
                        let msg = validateErrs[invalidInputName]
                        invalidInputs.push({ input, msg })
                    } else {
                        console.log('@出現一個非法表格數據，怪的是此表格名不包含在表單內，此表格名為: ', invalidInputName)
                    }
                }
                /* 針對通過驗證的 inpName 進行處理*/
                for (let inputName of set_validInpNames) {
                    let input = $(`${formId} input[name=${inputName}]`).get(0)
                    validInputs.push(input)
                }
                /* 有效表格值的提醒 */
                for (let input of validInputs) {
                    formFeedback(2, input, true, '')
                }
                /* 非法表格值的提醒 */
                for (let { input, msg } of invalidInputs) {
                    formFeedback(2, input, false, msg.feedback)
                    //  若該非法表格未標記 has_debHandle，則替其inputEvent綁定驗證表格值的handle
                }
                return
            }
        }
        function initRegistFn() {
            const api_register = CONST.REGISTER.API
            const success_redir = '/login'
            const success_alert = '註冊成功，請嘗試登入'
            const inputs = ['password', 'password_again']
            let formFeedback = genFormFeedback(CONST.REGISTER.ACTION, inputs)
            let formType = CONST.REGISTER.ACTION
            let formId = CONST.SELECTOR.FORM(CONST.REGISTER.ACTION)
            let form = document.querySelector(formId)

            let payload = $$payload[formType]
            let validate_email = $$module_Validate['email']
            let validate_register = $$module_Validate['register']

            // deb_eventHandle(`${formId} ${CONST.SELECTOR.EMAIL}`, 'input', handle_isEmailExist)
            // deb_eventHandle(`${formId} input[name*=password]`, 'input', handle_input_register)
            deb_eventHandle(`${formId} input`, 'input', handle_input_register)
            form.addEventListener('submit', handle_submit_register)


            async function handle_isEmailExist(e) {
                let input = e.target
                let inputName = input.name
                payload[inputName] = input.value
                let validateErrs = await validate_email(payload)
                _handle_validateInputErrors(validateErrs, formId, ['email'], formFeedback, ['password', 'password_again'])
                // let msg = validateErrs ? validateErrs[inputName] : undefined
                // if (msg) {
                //     formFeedback(2, input, false, msg.feedback)
                // } else {
                //     formFeedback(2, input, true, '')
                // }
                input.focus()
            }
            async function handle_submit_register(e) {
                e.preventDefault()
                let validateErrs = await validate(payload)
                //  校驗
                if (validateErrs) {
                    _handle_validateRegisterErrors(validateErrs)
                    //  處理校驗錯誤
                    return
                }
                return
                /* 送出請求 */
                /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
                let { errno } = await _axios.post(api_register, payload)
                if (!errno) {
                    alert(success_alert)
                    location.pathname = success_redir
                }
                return
            }

            async function handle_input_register(e) {
                console.log('@開始')
                e.preventDefault()
                //  REGISTER
                let targetInput = e.target
                let targetInputName = targetInput.name
                let targetInputValue = targetInput.value
                e.target.mark = true
                //  指向$$payload裡對應的數據對象
                payload[targetInputName] = targetInputValue
                //  更新payload內的表格數據
                if(targetInputName === 'email'){
                    let validateErrs = await validate_email(payload)
                    _handle_validateInputErrors(validateErrs, formId, ['email'], formFeedback, ['password', 'password_again'])
                
                }else{
                    let validateErrs = await validate_register(payload)
                // _handle_validateRegisterErrors(validateErrs)
                _handle_validateInputErrors(validateErrs, formId, ['password', 'password_again'], formFeedback, ['email'])
                }
                return
            }
        }

        /* 處理校驗錯誤 ..............*/
        function _handle_validateInputErrors(validateErrs, selector_form, inputNames, formFeedback, excludes = []) {
            let invalidInputs = []
            //  存放無效值的inp
            let validInputs = []
            //  存放有效值的inp
            let set_validInpNames = new Set(inputNames)
            //  用來過濾出含有效值的inpName
            for (let invalidInputName in validateErrs) {
                if (excludes.length && excludes.some(exclude => exclude === invalidInputName)) {
                    //  email有專屬的較驗結果提醒
                    continue
                }
                if (set_validInpNames.has(invalidInputName)) {
                    set_validInpNames.delete(invalidInputName)
                    //  刪去無效值的inpName
                    let input = $(`${selector_form} input[name=${invalidInputName}]`).get(0)
                    let msg = validateErrs[invalidInputName]
                    invalidInputs.push({ input, msg })
                } else {
                    console.log('@出現一個非法表格數據，怪的是此表格名不包含在表單內，此表格名為: ', invalidInputName)
                }
            }
            /* 針對通過驗證的 inpName 進行處理*/
            for (let inputName of set_validInpNames) {
                console.log('@被加入validInputs => ', inputName, selector_form)
                let input = $(`${selector_form} input[name=${inputName}]`).get(0)
                validInputs.push(input)
            }
            console.log('@validInputs => ', validInputs)
            console.log('@invalidInputs => ', invalidInputs)
            /* 有效表格值的提醒 */
            for (let input of validInputs) {
                // lock_register.delete(input.name)
                formFeedback(2, input, true, '')
            }
            /* 非法表格值的提醒 */
            for (let { input, msg } of invalidInputs) {
                formFeedback(2, input, false, msg.feedback)
                //  若該非法表格未標記 has_debHandle，則替其inputEvent綁定驗證表格值的handle
            }
            return
        }
        function deb_eventHandle(selectorOrEl, eventType, handle) {
            let eles = typeof selectorOrEl === 'string' ? document.querySelectorAll(selectorOrEl) : [selectorOrEl]
            for (let ele of eles) {
                console.log('@ele => ', ele)
                if (ele.has_debHandle) {
                    continue
                }
                ele.has_debHandle = true
                const deb_handle = new Debounce(handle, {
                    loading: (e) => {
                        console.log('延遲loading')
                        let input = e.target
                        feedback(1, input)
                        $(input).parents('form').eq(0).prop('disabled', true)
                    }
                })
                ele.addEventListener(eventType, (e) => deb_handle.call(e))
            }
        }
        function genFormFeedback(action, inputs) {
            let lock = new Set(inputs)
            const formId = CONST.SELECTOR.FORM(action)
            let $submit = $(`${formId} button[type=submit]`).eq(0)
            return (status, input, valid, msg) => {
                let key = input.name
                if (status === 2) {
                    if (valid) {
                        lock.delete(key)
                    } else {
                        lock.add(key)
                    }
                    $submit.prop('disabled', lock.size)
                }
                feedback(status, input, valid, msg)
            }
        }
    }
})