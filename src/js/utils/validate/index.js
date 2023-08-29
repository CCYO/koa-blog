import ajv from './_ajv'
import { EMAIL, REGISTER, LOGIN } from './_ajv/schema'

function genValidate(schema) {
    let _validate = ajv.compile(schema)
    return async (data, parseErrorForFeedBack = true) => {
        try {
            await _validate(data)
            if (_validate.errors) {
                let e = new Error()
                e.errors = _validate.errors
                throw e
            }
            return null
        } catch (err) {
            let { errors } = err
            if (errors) {
                let _errors = _parseValidateErrors(errors)
                //  { fieldName: { keyword1: message1,  keyword2: message2, ...}, ... }
                console.log('@整理後的validateErrors => ', _errors)
                if (parseErrorForFeedBack) {
                    _errors = _parseErrorsToForm(_errors)
                    //  { 表格名1: message1, 表格名2: message2, ... }
                    console.log('@提供給feedback使用的錯誤資訊 => ', _errors)
                    return _errors
                }
                return res
            } else {
                throw err
            }
        }
    }
}

//  參考 https://ajv.js.org/api.html#error-parameters
const map_keyword_to_param = {
    required: 'missingProperty',
    // dependentRequired: 'missingProperty' 目前schema都沒用到
}
function _parseValidateErrors(validateErrors) {
    /*{ 
        errors: [ { ..., message: 自定義的錯誤說明, ... }, ...],
      }*/
    console.log('@validate handle 要處理的 errors => ', validateErrors)
    return validateErrors.reduce((init, validateError) => {
        let {
            keyword,
            //  "errorMessage": 代表此時顯示的驗證錯誤，是ajv-errors預先在schema設定錯誤提示
            //  其他狀況，則代表該錯誤我未使用ajv-errors預先設定(通常是schema最高級的keyword，ex: if/else)
            params,
            //  ajv-error捕獲到的錯誤，原生ajv錯誤資訊會放入params.errors
            instancePath,
            //  validatedData 發生錯誤的JSON Pointer(ex: "/email")
            //  若值為""，代表JSON Pointer指向validatedData顯示不出來的位置(通常是更高級的地方，ex: schema.type)
            message
            //  ajv-errors針對當前錯誤設定錯誤提示，或是原生錯誤提醒
        } = validateError
        let fieldName = instancePath.slice(1)
        //  去除'/'
        /* 非 ajv-errors 捕獲的錯誤 */
        if (keyword !== 'errorMessage') {
            if (!params.myKeyword) {
                console.log('@提醒用，不被處理的錯誤 => \n keyword: ', keyword, '\n message: ', message)
            }else{
                if(!init.hasOwnProperty(fieldName)){
                    init[fieldName] = {}
                }
                init[fieldName][keyword] = message
            }
            return init
        }
        /* 被 ajv-errors 捕獲的錯誤，會將 ajv 原本整理的錯誤資訊匯入 params 內，即 params.errors */
        for (let originError of params.errors) {
            let originKeyword = originError.keyword
            console.log('@原錯誤 => \n', originError)
            if (!instancePath) {
                /* schema 最高等級的錯誤 */
                let originParam = map_keyword_to_param[originKeyword]
                fieldName = originParam ? originError.params[originParam] : 'all'
                console.log(`@從最高級錯誤${originKeyword}取得fieldName => `, fieldName)
                //  若 _param 不是列在map_keyword_to_param上的key，則代表此次的錯誤應該是使用者使用JS才發生的錯誤
            }
            console.log('@fieldName => ', fieldName)
            if (!init.hasOwnProperty(fieldName)) {
                init[fieldName] = {}
            }
            init[fieldName][originKeyword] = message
        }
        return init
    }, {})
}

function _parseErrorsToForm(myErrors) {
    return Object.entries(myErrors).reduce((res, [fieldName, KVpairs]) => {
        let msg = Object.entries(KVpairs).reduce((_msg, [keyword, message], index) => {
            if (index > 0) {
                _msg += ','
            }

            return _msg += message
        }, '')
        if (!res[fieldName]) {
            res[fieldName] = {}
        }
        let fieldName_tw = _toTw(fieldName)
        !fieldName_tw && console.log('@fieldName 找不到對應的中文 => ', fieldName)
        res[fieldName].alert = `【${fieldName_tw}】欄位值${msg}`
        res[fieldName].feedback = msg
        return res
    }, {})
}

function _toTw(fieldName) {
    const map = {
        //	全局錯誤
        all: 'all',
        //	register
        email: '信箱',
        password: '密碼',
        password_again: '密碼確認',
        //	blog
        title: '文章標題',
        contetn: '文章內文',
        show: '文章狀態',
        //	setting
        nickname: '暱稱',
        age: '年齡',
        avatar: '頭像',
        avatar_hash: '頭像hash',
        // myKeyword
        confirm_password: '密碼驗證',

    }
    return map[fieldName]
}

export {
    genValidate
}

export default {
    email: genValidate(EMAIL),
    register: genValidate(REGISTER),
    login: genValidate(LOGIN)
}