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
                return _parseValidateErrors(errors)
            } else {
                throw err
            }
        }
    }
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
        /* schema 最高等級的錯誤 */
        if (!instancePath) {
            if (keyword === 'errorMessage') {
                /* 已被 ajv-errors 捕獲的錯誤 */
                let { errors } = params
                //  errors 是array，包含原生定義的錯誤資訊
                let _keyword = errors[0].keyword
                if (_keyword === 'required' || _keyword === 'dependentRequired') {
                    for (let { params: { missingProperty } } of errors) {
                        if (!init.hasOwnProperty('required')) {
                            init['required'] = []
                        }
                        if (init['required'].some(prop => prop === missingProperty)) {
                            continue
                        }
                        init['required'].push(missingProperty)
                    }
                } else if (_keyword === 'minProperties') {
                    init['all'] = message
                }
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

function handleErrors(myErrors) {
	Object.entries(myErrors).reduce((_errors, [inputName, KVpairs]) => {
		let msg = Object.entries(KVpairs).reduce((_msg, [keyword, message], index) => {
			if (index > 0) {
				msg += ','
			}
			return _msg += message
		}, '')
		_errors[_getName(inputName)] = msg
		return _errors
	}, {})
}

function _getName(inputName) {
	const map = {
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
		avatar_hash: '頭像hash',
		//	全局錯誤
		all: '注意'
	}
	return map[inputName]
}

export {
	genValidate,
	handleErrors
}

export default {
    email: genValidate(EMAIL),
    register: genValidate(REGISTER)
}