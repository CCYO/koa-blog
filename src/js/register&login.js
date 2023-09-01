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
            // let formFeedback = genFormFeedback(CONST.LOGIN.ACTION, inputs)
            let formType = CONST.LOGIN.ACTION
            let formId = CONST.SELECTOR.FORM(CONST.LOGIN.ACTION)
            let form = document.querySelector(formId)
            let payload = $$payload[formType]
            let validate_login = $$module_Validate['login']
            let lock = new Set()
            for (let input of form) {
                const { name, type } = input
                if (type === 'submit') {
                    continue
                } else {
                    lock.add(name)
                }
            }

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
                _handle_validateInputErrors(validateErrs, form, lock, ['email', 'password'])
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
            let formType = CONST.REGISTER.ACTION
            let formId = CONST.SELECTOR.FORM(CONST.REGISTER.ACTION)
            let form = document.querySelector(formId)

            let payload = $$payload[formType]
            let validate_email = $$module_Validate['isEmailExist']
            let validate_password = $$module_Validate['passwordAndAgain']
            let lock = new Set()
            for (let input of form) {
                const { name, type } = input
                if (type === 'submit') {
                    continue
                } else {
                    lock.add(name)
                }
            }
            deb_eventHandle(`${formId} input`, 'input', handle_input_register)
            form.addEventListener('submit', handle_submit_register)


            
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
                if (targetInputName === 'email') {
                    let validateErrs = await validate_email(payload, false)
                    _handle_validateInputErrors(validateErrs, form, lock)

                } else {
                    let validateErrs = await validate_password(payload, false)
                    _handle_validateInputErrors(validateErrs, form, lock)
                }
                return
            }
        }

        /* 處理校驗錯誤 ..............*/
        function _handle_validateInputErrors(validateErrs, form, lock, targetInputNames = []) {
            //  inputNames 需要被校驗的 input.name
            //  excludes 不需要 feedback 的 input.name

            //  撈出form的所有需要顯示提醒的input
            let needFeedback = [...form].reduce((res, input) => {
                if(input.type === 'submit'){
                    res.$submit = $(input)
                }else if(!input.mark){
                    return res
                }else{
                    res.inputs.push(input)
                    res.set_inputNames.add(input.name)
                }
                return res
            }, { inputs: [], set_inputNames: new Set(), $submit: undefined})
            //  


            // let excludes = map.get(inputNames)
            // let $submit = $(form).find('[type=submit]').eq(0)
            let invalidInputs = []
            //  存放無效值的inp
            let validInputs = []
            //  存放有效值的inp
            let set_validInpNames = needFeedback.set_inputNames
            let $submit = needFeedback.$submit
            //  用來過濾出含有效值的inpName
            /* 蒐集無效inputs */
            console.log('@needFeedback => ', needFeedback)
            console.log('@validateErrs => ', validateErrs)
            for (let invalidInputName in validateErrs) {
                let validateErr = validateErrs[invalidInputName]
                console.log('@validateErr---- => ', validateErr)
                if(validateErr.hasOwnProperty('additionalProperties')){
                    console.log('刪除', invalidInputName)
                    set_validInpNames.delete(invalidInputName)
                    delete validateErrs[invalidInputName]
                    continue
                }

                if(set_validInpNames.has(invalidInputName)){
                    set_validInpNames.delete(invalidInputName)
                } else {
                    console.log('@出現一個非法表格數據，怪的是此表格名不包含在表單內，此表格名為: ', invalidInputName)
                }
            }
            /* 針對通過驗證的 inpName 進行處理*/
            for (let inputName of set_validInpNames) {
                let input = $(form).find(`input[name=${inputName}]`).get(0)
                formFeedback(2, input, true, '')
            }
            /* 有效表格值的提醒 */
            /* 非法表格值的提醒 */
            let _validateErrs = validateErrs.parseErrorsToForm(validateErrs)
            console.log('@再一次撈取後的validateErrs => ', _validateErrs)
            for (let inputName in _validateErrs) {
                console.log('@@@ => ', inputName)
                let input = $(form).find(`input[name=${inputName}]`).get(0)
                    let msg = _validateErrs[inputName]
                    // invalidInputs.push({ input, msg })
                    console.log('@msg => ', msg)
                formFeedback(2, input, false, msg.feedback)
                //  若該非法表格未標記 has_debHandle，則替其inputEvent綁定驗證表格值的handle
            }
            return

            function formFeedback(status, input, valid, msg) {
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
        function genFormFeedback(form) {
            let $submit
            let lock = new Set()
            for (let input of form) {
                const { name, type } = input
                if (type === 'submit') {
                    $submit = input
                } else {
                    lock.add(name)
                }
            }
            // let lock = new Set(inputs)
            // let $submit = $(form).find(`button[type=submit]`).eq(0)
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