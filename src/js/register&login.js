if(process.env.NODE_ENV === 'development'){
    console.log(123)
    require('../views/register&login.ejs')
}

import '../css/basic.css'

import { genBackdrop } from './utils/commonUI'
import genDebounce from './utils/genDebounce'
import validate from './utils/validate.js'
import _axios from './utils/_axios'

import initPageFn from './utils/initData.js'
//  統整頁面數據、渲染頁面的函數
import initNavbar from './utils/navbar.js'
//  初始化 Navbar
import initEJSData from './utils/initEJSData.js'

let { loadEnd, loading } = genBackdrop()
//  初始化來自ejs在頁面上的字符數據
try {
    loading()
    console.log('loading start -----')
    //  讀取中，遮蔽畫面
    let initPage = new initPageFn()
    await initPage.addOtherInitFn(initEJSData)
    //  初始化ejs
    await initPage.addOtherInitFn(initNavbar)
    //  初始化navbar
    await initPage.render(renderPage)
    //  統整頁面數據，並渲染需要用到統整數據的頁面內容
    loadEnd()
    //  讀取完成，解除遮蔽
} catch (error) {
    throw error
    // location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
}

if (module.hot) {
    module.hot.accept('./utils/genDebounce', function () {
        console.log('genDebounce OK!');
    })
}

function renderPage() {
    const CONST = {
        REGISTER: {
            FORM: 'register',
            API: '/api/user/register',
        },
        LOGIN: {
            FORM: 'login',
            API: '/api/user',
        }
    }
    let $$validate = validate
    let $$payload = {
        login: {},
        register: {}
    }
    const deb_handle_isEmailExist = genDebounce(handle_isEmailExist)
    const deb_handle_register = genDebounce(handle_form(CONST.REGISTER))
    const deb_handel_login = genDebounce(handle_form(CONST.LOGIN))
    $('form[data-my-type=register] input[name=email]').on('input', deb_handle_isEmailExist)
    $('form[data-my-type=register]').on('submit', deb_handle_register)
    $('form[data-my-type=login]').on('submit', deb_handel_login)

    async function handle_isEmailExist(e) {
        let el = e.target
        let form = $(el).parents('form')[0]
        let formType = form.dataset['myType']
        let datas = $$payload[formType]
        let inpVal = el.value
        datas.email = inpVal
        let validateRes = await $$validate.email(datas)
        if (validateRes) {
            let msg = validateRes['email']
            feedback_UI(el, false, msg)
            return
        }
        feedback_UI(el, true, '')
        el.focus()
    }
    function handle_form(ACTION) {
        return async function _(e) {
            e.preventDefault()
            let ele = e.target
            let formType = ACTION.FORM
            let api = ACTION.API
            let form = document.querySelector(`form[data-my-type=${formType}]`)
            //  取得 formType
            let datas = $$payload[formType]
            let invalidInps = []
            //  存放無效值的inp
            let validInps = []
            //  存放有效值的inp
            let validate = $$validate[formType]
            if (e.type === 'input') {
                /* input 代表是由 input 觸發*/
                datas[ele.name] = ele.value
                //  更新$$datas內的表格數據
            } else {
                /* submit 代表是由 form 觸發，蒐集表單數據*/
                for (let inp of form) {
                    console.log('@inp => ', inp)
                    if (inp.type === 'submit' || (formType === 'register' && inp.name === 'email')) {
                        /* submit沒資料，email則有獨立handle*/
                        continue
                    }
                    datas[inp.name] = inp.value
                    //  將表格數據存入$$datas
                }
            }
            let validateErrs = await validate(datas)
            //  驗證
            if (e.type === 'input') {
                /* 整理此次 input 影響的錯誤提醒，以及表格的綁定事件 */
                for (let inp of form) {
                    let inputName = inp.name
                    if (inp.type === 'submit' || (formType === 'register' && inputName === 'email')) {
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
                    return inp.type !== 'submit' && !(formType === 'register' && inp.name === 'email')
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
                let { errno, msg } = await _axios.post(api, datas)
                if (!errno) {
                    if (formType === 'login') {
                        alert('登入成功')
                        let from = location.search ? new URLSearchParams(location.search).get('from') : false
                        location.href = from ? from : '/self'
                    } else {
                        alert('註冊成功，請嘗試登入')
                        location.pathname = '/login'
                    }
                } else {
                    alert(msg)
                    $(form)[0].reset()
                    datas = {}
                    feedback_UI(false)
                }
                return
            }
            for (let inp of validInps) {
                feedback_UI(inp, true, '')
            }
            for (let { inp, msg } of invalidInps) {
                feedback_UI(inp, false, msg)
                inp.removeEventListener('input', _)
                inp.addEventListener('input', _)
            }
            return
        }
    }
    //  input 的 valicate UI
    function feedback_UI(inp, valid, msg) {
        if (inp === false) {
            for (let form of $('form')) {
                for (let inp of form) {
                    $(inp).removeClass('is-invalid is-valid')
                    $(inp).next().removeClass('invalid-feedback valid-feedback myshow').text('')
                }
            }
        } else if (valid === 'load') {
            //  驗證中
            $(inp).next().toggleClass('my-show', true).text('loading...')
        } else if (valid) {
            //  驗證成功
            $(inp).removeClass('is-invalid').addClass('is-valid')
            $(inp).next().removeClass('invalid-feedback myshow').addClass('valid-feedback').text(msg)
        } else {
            //  驗證失敗
            $(inp).removeClass('is-valid').addClass('is-invalid')
            $(inp).next().removeClass('valid-feedback myshow').addClass('invalid-feedback').text(msg)
        }
    }
}