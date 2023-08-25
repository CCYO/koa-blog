import ajv from './_ajv'
import { EMAIL, REGISTER } from './_ajv/schema'

function genValidate(schema) {
    let _validate = ajv.compile(schema)
    return async (data) => {
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
                let _res = _parseValidateErrors(errors)
                console.log('@_res => ', _res)
                let res = handleErrorsToForm(_res)
                console.log('@res => ', res)
                return res
            } else {
                throw err
            }
        }
    }
}
function __parseValidateErrors(validateErrors) {
    /*{ 
        errors: [ { ..., message: 自定義的錯誤說明, ... }, ...],
      }*/
    console.log('@validate handle 要處理的 errors => ', validateErrors)
    return validateErrors.reduce((init, validateError) => {
        let {
            params, //  不知如何運用
            keyword,
            //  "errorMessage": 代表此時顯示的驗證錯誤，是ajv-errors預先在schema設定錯誤提示
            //  其他狀況，則代表未使用ajv-errors預先設定錯誤提醒(通常是違反了schema的最高級keyword產生的驗證錯誤，如if/else)
            instancePath,
            //  在將schema整體視為url的情況下，instancePath表示驗證錯誤所在的路徑
            //  "": 代表違反 schema最高級keyword產生的驗證錯誤（如　required || if || then 等）
            message
            //  ajv-errors針對當前錯誤設定錯誤提示，或是原生錯誤提醒
        } = validateError
        /* schema 最高等級的錯誤 */
        if (!instancePath) {
            if (keyword === 'errorMessage') {
                /* 已被 ajv-errors 捕獲的錯誤 */
                let key = 'all'
                let { errors } = params
                //  errors 是array，包含原生定義的錯誤資訊
                for (let _error of params.errors) {
                    if (_error.keyword === 'required') {
                        let fieldName = _error.params.missingProperty
                        if (!init.hasOwnProperty(key)) {
                            init[key] = []
                        }
                        init[key].push(fieldName)
                    }
                }
                console.log('@init => ', init)
                // let _keyword = errors[0].keyword
                // if (_keyword === 'required' || _keyword === 'dependentRequired') {
                //     for (let { params: { missingProperty } } of errors) {
                //         if (!init.hasOwnProperty('required')) {
                //             init['required'] = []
                //         }
                //         if (init['required'].some(prop => prop === missingProperty)) {
                //             continue
                //         }
                //         init['required'].push(missingProperty)
                //     }
                // } else if (_keyword === 'minProperties') {
                //     init['all'] = message
                // }
            }
            /* 未被 ajv-errors 捕獲的錯誤，我不考慮（如 if、then、allOf 等）*/
        } else {
            /* 通常是 schema 非高等級的錯誤，這次的應用會是對應 properties 的內容 */
            let name = instancePath.slice(1)
            //  去除'/'
            if (keyword === 'errorMessage') {
                /* 已被 ajv-errors 捕獲的錯誤 */
                const { errors: [_error] } = params
                keyword = _error.keyword
            }
            if (!init.hasOwnProperty(name)) {
                init[name] = {}
            }
            if (!init[name].hasOwnProperty(keyword)) {
                init[name][keyword] = message
            } else {
                init[name][keyword] += message
            }
        }
        return init
    }, {})
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
            params, //  不知如何運用
            keyword,
            //  "errorMessage": 代表此時顯示的驗證錯誤，是ajv-errors預先在schema設定錯誤提示
            //  其他狀況，則代表未使用ajv-errors預先設定錯誤提醒(通常是違反了schema的最高級keyword產生的驗證錯誤，如if/else)
            instancePath,
            //  在將schema整體視為url的情況下，instancePath表示驗證錯誤所在的路徑
            //  "": 代表違反 schema最高級keyword產生的驗證錯誤（如　required || if || then 等）
            message
            //  ajv-errors針對當前錯誤設定錯誤提示，或是原生錯誤提醒
        } = validateError
        /* 非 ajv-errors 捕獲的錯誤 */
        if (keyword !== 'errorMessage') {
            return init
        }
        let fieldName = instancePath.slice(1)
        //  去除'/'
        /* 被 ajv-errors 捕獲的錯誤，會將 ajv 原本整理的錯誤資訊匯入 params 內，即 params.errors */
        for (let _error of params.errors) {
            let _keyword = _error.keyword
            if (!fieldName) {
                /* schema 最高等級的錯誤 */
                let _param = map_keyword_to_param[_keyword]
                fieldName = _param ? _error.params[_param] : 'all'
                //  若 _param 不是列在map_keyword_to_param上的key，則代表此次的錯誤應該是使用者使用JS才發生的錯誤
            }
            
            if (!init.hasOwnProperty(fieldName)) {
                init[fieldName] = {}
            }
            init[fieldName][_keyword] = message
        }
        return init
    }, {})
}

function handleErrorsToForm(myErrors){
    return Object.entries(myErrors).reduce((res, [fieldName, KVpairs]) => {
        let msg = Object.entries(KVpairs).reduce((_msg, [keyword, message], index) => {
            if (index > 0) {
                msg += ','
            }
            return _msg += message
        }, '')
        let name = _toTw(fieldName)
        res[name] = msg
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
        confirm_assword: '密碼驗證',
        //	blog
        title: '文章標題',
        contetn: '文章內文',
        show: '文章狀態',
        //	setting
        nickname: '暱稱',
        age: '年齡',
        avatar: '頭像',
        avatar_hash: '頭像hash'
    }
    return map[fieldName]
}

export {
    genValidate
}

export default {
    email: genValidate(EMAIL),
    register: genValidate(REGISTER)
}