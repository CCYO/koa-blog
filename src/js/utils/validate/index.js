import { dev_log as $F_log } from '../log'
import ajv from './_ajv'
import { IS_EMAIL_EXIST, PASSWORD_AND_AGAIN, REGISTER, LOGIN } from './_ajv/schema'

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
                $F_log('@整理後的validateErrors => ', _errors)
                if (parseErrorForFeedBack) {
                    _errors = parseErrorsToForm(_errors)
                    //  { 表格名1: message1, 表格名2: message2, ... }
                }
                return _errors
            } else {
                throw err
            }
        }
    }
}

//  參考 https://ajv.js.org/api.html#error-parameters
const map_keyword_to_param = {
    required: 'missingProperty',
    additionalProperties: 'additionalProperty'
    // dependentRequired: 'missingProperty' 目前schema都沒用到
}
function _parseValidateErrors(validateErrors) {
    /*{ 
        errors: [ { ..., message: 自定義的錯誤說明, ... }, ...],
      }*/
    return validateErrors.reduce((init, validateError) => {
        let {
            keyword,
            //  "errorMessage": 代表此時顯示的驗證錯誤，是ajv-errors預先在schema設定錯誤提示
            //  其他狀況，則代表該錯誤我未使用ajv-errors預先設定(通常是schema最高級的keyword，ex: if/else)
            params,
            //  ajv-error捕獲到的錯誤，原生ajv錯誤資訊會放入params.errors
            instancePath,
            //  validatedData 發生錯誤的JSON Pointer(ex: "/email")
            //  若值為""，代表validatedData牴觸的keyword，其指向比validatedData顯示不出來的更高級的JSON Pointer位置(ex: schema.if)
            message
            //  ajv-errors針對當前錯誤設定錯誤提示，或是原生錯誤提醒
        } = validateError
        let fieldName = instancePath.slice(1)
        //  去除'/'
        /* 非 ajv-errors 捕獲的錯誤 */
        if (keyword !== 'errorMessage') {
            if (!params.myKeyword) {
                $F_log('@提醒用，不被處理的錯誤 => \n keyword: ', keyword, '\n message: ', message)
            }else{
                if(!init.hasOwnProperty(fieldName)){
                    init[fieldName] = {}
                }
                init[fieldName][keyword] = message
            }
            return init
        }
        /*
            被 ajv-errors 捕獲的錯誤 errors，其item:error的keyword都是'errorMessage'
            實際發生錯誤的keyword，則在 error.params.errors 裡的 item: error.keyword
        */
        for (let originError of params.errors) {
            let originKeyword = originError.keyword
            //  被ajv-errors捕獲的錯誤
            if (!instancePath) {
                /* schema 最高等級的錯誤 */
                let originParam = map_keyword_to_param[originKeyword]
                //  高級別的錯誤，其keyword也是指向高級別，要找到此高級別keyword是校驗出validatedData的哪些key，
                //  ajv會將keys放入originError.params裡，而originError.params是kvPairs，
                //  kvPair的key是ajv預先對應originKeyword設定的，可參考 https://ajv.js.org/api.html#error-parameters
                fieldName = originParam ? originError.params[originParam] : 'all'
                $F_log(`@現在處理validateErr的高層級錯誤『${originKeyword}』，發生錯誤的fieldName指向 => `, fieldName)
            }
            if (!init.hasOwnProperty(fieldName)) {
                init[fieldName] = {}
            }
            init[fieldName][originKeyword] = message
        }
        return init
    }, {})
}

function parseErrorsToForm(myErrors) {
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
        let fieldName_tw = en_to_tw_for_fieldName(fieldName)
        !fieldName_tw && console.log('@fieldName 找不到對應的中文 => ', fieldName)
        res[fieldName] = {
            get alert(){
                return `【${fieldName_tw}】欄位值${msg}`
            },
            get feedback(){
                return msg
            }
        }
        return res
    }, {})
}

function en_to_tw_for_fieldName(fieldName) {
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

export default {
    parseErrorsToForm,
    isEmailExist: genValidate(IS_EMAIL_EXIST),
    passwordAndAgain: genValidate(PASSWORD_AND_AGAIN),
    register: genValidate(REGISTER),
    login: genValidate(LOGIN)
}