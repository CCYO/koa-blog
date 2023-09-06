/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

if (process.env.NODE_ENV === 'development') {
    require('../views/register&login.ejs')
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import '../css/register&login.css'

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
    ui as $M_UI,
    Debounce as $M_Debounce,
    validate as $M_validate,
    _axios as $M_axios,
    wedgets as $M_wedgets
} from './utils'

/* ------------------------------------------------------------------------------------------ */
/* Const --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const CONS = {
    LOGIN: {
        API: '/api/user',
        REDIR_QUERY: 'from',
        REDIR: '/self',
        SUCC_MSG: '登入成功',
        FAIL_MSG: '登入失敗，請重新嘗試',
        FORM_ID: '#login-form'
    },
    REGISTER: {
        API: '/api/user/register',
        REDIR: '/login',
        SUCC_MSG: '註冊成功，請嘗試登入',
        FAIL_MSG: '登入失敗，請重新嘗試',
        FORM_ID: '#register-form'
    }
}

/* ------------------------------------------------------------------------------------------ */
/* Class --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const $C_backdrop = new $M_wedgets.LoadingBackdrop()
//  讀取遮罩

/* ------------------------------------------------------------------------------------------ */
/* Run --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
window.addEventListener('load', async () => {
    try {
        $C_backdrop.show({ blockPage: true })
        //  讀取中，遮蔽畫面
        let initPage = new $M_wedgets.InitPage()
        //  幫助頁面初始化的統整函數
        await initPage.addOtherInitFn($M_wedgets.initNavbar)
        //  初始化navbar
        await initPage.render(initMain)
        //  統整頁面數據，並渲染需要用到統整數據的頁面內容
        $C_backdrop.hidden()
        //  讀取完成，解除遮蔽
    } catch (error) {
        if (confirm('window load 時發生錯誤，前往錯誤原因頁面')) {
            location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
        } else {
            console.warn('↓↓↓ window load 報錯 ↓↓↓↓ ')
            throw error
        }
    }
    /* 初始化頁面內容功能 */
    function initMain() {
        initRegistFn()
        //  初始化 Register Form 功能
        initLoginFn()
        //  初始化 Register Form 功能
        /* 初始化 Register Form 功能 */
        function initLoginFn() {
            let form = document.querySelector(CONS.LOGIN.FORM_ID)
            let payload = {}
            let feedback_for_Form = gen_feedback_for_Form(form)
            deb_eventHandle(`${CONS.LOGIN.FORM_ID} input`, 'input', handle_input_login)
            form.addEventListener('submit', handle_submit_login)
            /* 登入表單 submit Event handler */
            async function handle_submit_login(e) {
                e.preventDefault()
                let validateErrs = await $M_validate.login(payload)
                //  校驗
                if (validateErrs) {
                    payload = {}
                    alert(CONS.LOGIN.FAIL_MSG)
                    location.reload()
                    return
                }
                //  處理校驗錯誤
                /* 送出請求 */
                /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
                let { errno } = await $M_axios.post(CONS.LOGIN.API, payload)
                if (!errno) {
                    alert(CONS.LOGIN.SUCC_MSG)
                    location.pathname = location.search ? new URLSearchParams(location.search).get(CONS.LOGIN.REDIR_QUERY) : CONS.LOGIN.REDIR
                }
                return
            }
            /* 登入表單內容表格的 input Event handler */
            async function handle_input_login(e) {
                e.preventDefault()
                //  LOGIN
                let targetInput = e.target
                let targetInputName = targetInput.name
                let targetInputValue = targetInput.value
                e.target.mark = true
                //  指向$$payload裡對應的數據對象
                payload[targetInputName] = targetInputValue
                //  更新payload內的表格數據
                let validateErrs = await $M_validate.login(payload, false)
                feedback_for_Form(validateErrs)
                return
            }
        }
        /* 初始化 Register Form 功能 */
        function initRegistFn() {
            const form = document.querySelector(CONS.REGISTER.FORM_ID)
            let payload = {}
            let feedback_for_Form = gen_feedback_for_Form(form)
            deb_eventHandle(`${CONS.REGISTER.FORM_ID} input`, 'input', handle_input_register)
            form.addEventListener('submit', handle_submit_register)
            /* 註冊表單 submit Event handler */
            async function handle_submit_register(e) {
                e.preventDefault()
                let validateErrs = await $M_validate.register(payload)
                //  校驗
                if (validateErrs) {
                    payload = {}
                    alert(CONS.REGISTER.FAIL_MSG)
                    location.reload()
                    return
                }
                console.log('@payload => ', payload)
                return
                /* 送出請求 */
                /* 若 eventType != input，且表單都是有效數據，發送 register 請求 */
                let { errno } = await $M_axios.post(CONS.REGISTER.API, payload)
                if (!errno) {
                    alert(CONS.REGISTER.SUCC_MSG)
                    location.href = CONS.REGISTER.REDIR
                }
                return
            }
            /* 註冊表單內容表格的 input Event handler */
            async function handle_input_register(e) {
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
                    let validateErrs = await $M_validate.isEmailExist(payload, false)
                    feedback_for_Form(validateErrs)
                } else {
                    let validateErrs = await $M_validate.passwordAndAgain(payload, false)
                    feedback_for_Form(validateErrs)
                }
                return
            }
        }

        /* ------------------------------------------------------------------------------------------ */
        /* Utils ------------------------------------------------------------------------------------ */
        /* ------------------------------------------------------------------------------------------ */

        /* genFn => 處理校驗錯誤 ..............*/
        function gen_feedback_for_Form(form) {
            /* 管理form可否submit的鎖 */
            class Lock {
                constructor(form) {
                    this.lock = new Set()
                    this.$submit = undefined
                    this.inputs = []
                    for (let input of form) {
                        const { name, type } = input
                        if (type === 'submit') {
                            this.$submit = $(input)
                        } else {
                            this.inputs.push(input)
                            this.lock.add(name)
                        }
                    }
                }
                add(inputName) {
                    this.lock.add(inputName)
                    this.checkSubmit()
                }
                delete(inputName) {
                    this.lock.delete(inputName)
                    this.checkSubmit()
                }
                checkSubmit() {
                    this.$submit.prop('disabled', this.lock.size)
                }
            }
            let lock = new Lock(form)
            /* 藉由validateErrors，判斷form可否submit，並於input顯示校驗錯誤 */
            return (validateErrs) => {
                let valid_inputs = [...lock.inputs]
                /* 蒐集無效inputs */
                for (let invalid_inputName in validateErrs) {
                    let validateErr = validateErrs[invalid_inputName]
                    if (validateErr.hasOwnProperty('additionalProperties')) {
                        /* 處理校驗結果中的「未預期的額外數據」錯誤 */
                        delete validateErrs[invalid_inputName]
                        //  從validateErrs內刪除該預期外的指定數據
                    }
                    let index = valid_inputs.findIndex(({ name }) => name === invalid_inputName)
                    if (index) {
                        valid_inputs.splice(index, 1)
                    }
                }
                /* 有效表格值的提醒 */
                for (let valid_input of valid_inputs) {
                    if (!valid_input.mark) {
                        continue
                    }
                    lock.delete(valid_input.name)
                    $M_UI.feedback(2, valid_input, true)
                }
                //  轉換validateErrs格式
                if (validateErrs && Object.keys(validateErrs).length) {
                    validateErrs = $M_validate.parseErrorsToForm(validateErrs)
                }
                /* 無效表格值的提醒 */
                for (let inputName in validateErrs) {
                    let input = $(form).find(`input[name=${inputName}]`).get(0)
                    if (!input.mark) {
                        continue
                    }
                    let msg = validateErrs[inputName]
                    lock.add(inputName)
                    $M_UI.feedback(2, input, false, msg.feedback)
                    //  若該非法表格未標記 has_debHandle，則替其inputEvent綁定驗證表格值的handle
                }
                return
            }
        }
        /* 將事件做防抖動設置，並綁定事件 */
        function deb_eventHandle(selectorOrEl, eventType, handle) {
            let eles = typeof selectorOrEl === 'string' ? document.querySelectorAll(selectorOrEl) : [selectorOrEl]
            for (let ele of eles) {
                if (ele.has_debHandle) {
                    continue
                }
                ele.has_debHandle = true
                const deb_handle = new $M_Debounce(handle, {
                    loading: (e) => {
                        let input = e.target
                        $M_UI.feedback(1, input)
                        $(input).parents('form').eq(0).prop('disabled', true)
                    }
                })
                ele.addEventListener(eventType, (e) => deb_handle.call(e))
            }
        }
    }
})