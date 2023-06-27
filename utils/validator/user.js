/**
 * @description 校驗 user 的 資料格式
 */
const { login } = require('../../controller/user')
const { VALIDATE: { USER: VALIDATE_USER } } = require('../../conf/constant')
const { isEmailExist } = require('../../controller/user')
const Ajv2019 = require("ajv/dist/2019")
const addFormats = require('ajv-formats')
const AjvErrors = require("ajv-errors")
const ajv = new Ajv2019({ allErrors: true, $data: true })
addFormats(ajv)
//  為 ajv 添加 format 關鍵字，僅適用 string 與 number
AjvErrors(ajv)
//  可使用 errorMessage 自定義錯誤提示
ajv.addKeyword({
    keyword: 'checkOriginPassword',
    type: 'string',
    schemaType: 'boolean',
    async: true,
    validate: async function checkOriginPassword(schema, origin_password, parentSchema, dataCtx) {
        if (!schema) {
            return true
        }
        let { email } = dataCtx.rootData.$$me
        let { errno, msg: message } = await login(email, origin_password)
        if (errno) {
            let { instancePath } = dataCtx
            throw new Ajv2019.ValidationError([{ instancePath, message }])
        }
        return true
    },
    errors: true
})
ajv.addKeyword({
    keyword: 'diff',
    $data: true,
    type: ['string', 'number'],
    schemaType: ['string', 'number', 'null'],
    validate: function diff(schema, data, parentSchema, dataCtx) {
        if (schema !== data || !schema) {
            return true
        }
        let { instancePath } = dataCtx
        diff.errors = [{ instancePath, message: '與原資料相同' }]
        return false
    },
    errors: true
})
ajv.addKeyword({
    keyword: 'noSpace',
    type: 'string',
    schemaType: 'boolean',
    validate: function noSpace(schema, data, parentSchema, dataCtx) {
        if (!schema) {
            return true
        }
        let regux = /\s/g
        if (regux.test(data)) {
            let { instancePath } = dataCtx
            noSpace.errors = [{ instancePath, message: '不可包含空格' }]
            return false
        }
        return true
    },
    errors: true
})
ajv.addKeyword({
    keyword: 'isExist',
    type: 'string',
    async: true,
    $data: true,
    schemaType: 'boolean',
    validate: async function isExist(schema, email, parentSchema, dataCtx) {
        if (!schema) {
            return true
        }
        let { errno, msg: message } = await isEmailExist(email)
        if (!errno) {
            return true
        }
        let { instancePath } = dataCtx
        throw new Ajv2019.ValidationError([{ instancePath, message }])
    },
    errors: true
})
const URL = 'http://my.ajv.schema'
const COMMON_ERR_MSG = {
    type: '驗證數據必須是 object 格式',
    required: '必填'
}
const DEF = {
    $id: `${URL}/defs.json`,
    definitions: {
        email: {
            type: 'string',
            format: 'email',
            noSpace: true,
            errorMessage: {
                type: '信箱資料必須是字符串',
                format: '信箱資料必須是電子信箱格式'
            }
        },
        nickname: {
            type: 'string',
            noSpace: true,
            pattern: '^[\\u4e00-\\u9fa5a-zA-Z\\d]+$',
            minLength: 2,
            maxLength: 20,
            errorMessage: {
                type: '暱稱必須是字符串',
                pattern: '暱稱必須是英文、數字以及底線組成',
                minLength: '暱稱必須小於2個字符',
                maxLength: '暱稱必須小於20個字符'
            }
        },
        password: {
            type: 'string',
            noSpace: true,
            pattern: '^[\\w]+$',
            minLength: 6,
            maxLength: 32,
            errorMessage: {
                type: '必須是字符串',
                pattern: '必須由英文、數字以及底線組成',
                minLength: '長度須介於6-32個字符',
                maxLength: '長度須介於6-32個字符'
            }
        },
        password_again: {
            type: 'string',
            const: {
                $data: '1/password'
            },
            errorMessage: {
                type: '必須是字符串',
                const: '請再次確認密碼是否相同',
            }
        },
        age: {
            type: 'number',
            minimum: 1,
            maximum: 120,
            errorMessage: {
                type: '必須是number',
                minimum: '必需介於1-120之間',
                maximum: '必需介於1-120之間'
            }
        },
        avatar: {
            type: 'string',
            format: 'url',
            errorMessage: {
                type: '必須是string',
                format: '資料需符合url格式'
            }
        },
        avatar_hash: {
            type: 'string',
            noSpace: true,
            errorMessage: {
                type: '必須是字符串'
            }
        }
    }
}
const EMAIL = {
    $id: `${URL}/email.json`,
    $async: true,
    type: 'object',
    properties: {
        email: { $ref: 'defs.json#/definitions/email' },
    },
    dependentSchemas: {
        email: {
            properties: {
                email: {
                    isExist: true,
                },
            }
        }
    },
    required: ['email'],
    errorMessage: { ...COMMON_ERR_MSG }
}
const REGISTER = {
    $id: `${URL}/register.json`,
    $async: true,
    type: 'object',
    properties: {
        email: { $ref: 'defs.json#/definitions/email' },
        password: { $ref: 'defs.json#/definitions/password' },
        password_again: { $ref: 'defs.json#/definitions/password_again' }
    },
    dependentSchemas: {
        email: {
            properties: {
                email: {
                    isExist: true
                }
            }
        }
    },
    required: ['email', 'password', 'password_again'],
    errorMessage: { ...COMMON_ERR_MSG }
}
const LOGIN = {
    $id: `${URL}/login.json`,
    type: 'object',
    properties: {
        email: { $ref: 'defs.json#/definitions/email' },
        password: { $ref: 'defs.json#/definitions/password' }
    },
    required: ['email', 'password'],
    errorMessage: { ...COMMON_ERR_MSG }
}
const SETTING = {
    $id: `${URL}/setting.json`,
    type: 'object',
    $async: true,
    minProperties: 2,
    properties: {
        $$me: {
            type: 'object',
            errorMessage: {
                type: '$$me需是object'
            }
        },
        email: {
            diff: { $data: '1/$$me/email' },
            $ref: 'defs.json#/definitions/email'
        },
        age: {
            diff: { $data: '1/$$me/age' },
            $ref: 'defs.json#/definitions/age'
        },
        nickname: {
            diff: { $data: '1/$$me/nickname' },
            $ref: 'defs.json#/definitions/nickname'
        },
        password: {
            diff: { $data: '1/origin_password' },
            $ref: 'defs.json#/definitions/password'
        },
        avatar: {
            $ref: 'defs.json#/definitions/avatar'
        }
    },
    dependentSchemas: {
        avatar: {
            properties: {
                avatar_hash: {
                    diff: { $data: '1/$$me/avatar_hash' },
                    $ref: 'defs.json#/definitions/avatar_hash'
                }
            }
        },
        password: {
            properties: {
                origin_password: {
                    $ref: 'defs.json#/definitions/password',
                    checkOriginPassword: true
                },
                password_again: {
                    $ref: 'defs.json#/definitions/password_again'
                }
            },
        }
    },
    dependentRequired: {
        origin_password: ['password', 'password_again'],
        password: ['origin_password', 'password_again'],
        password_again: ['origin_password', 'password'],
        avatar: ['avarar_hash'],
        avatar_hash: ['avarar']
    },
    required: ['$$me'],
    errorMessage: {
        ...COMMON_ERR_MSG,
        minProperties: '至少需改1筆資料',
        dependentRequired: '必須有值'
    }
}
ajv.addSchema(DEF)
const VALIDATE = {
    [VALIDATE_USER.IS_EMAIL_EXIST]: ajv.compile(EMAIL),
    [VALIDATE_USER.REGISTER]: ajv.compile(REGISTER),
    [VALIDATE_USER.LOGIN]: ajv.compile(LOGIN),
    [VALIDATE_USER.SETTING]: ajv.compile(SETTING)
}
function _handleErr(validateErrors) {
    /*{ 
        errors: [ { ..., message: 自定義的錯誤說明, ... }, ...],
      }*/
    return validateErrors.reduce((init, { params, keyword, instancePath, message }) => {
        if (!instancePath) {
            /* 通常是 schema 最高等級的錯誤，換句話說，通常不會是 data 上能查詢到的 keyword（如　required || if || then 等） */
            if (keyword === 'errorMessage') {
                /* 已被 ajv-errors 捕獲的錯誤 */
                let { errors } = params
                let _keyword = errors[0].keyword
                if (_keyword === 'required' || _keyword === 'dependentRequired') {
                    for (let { params: { missingProperty } } of errors) {
                        init[missingProperty] = message
                    }
                } else if (_keyword === 'minProperties') {
                    init['all'] = message
                }
            }
            /* 未被 ajv-errors 捕獲的錯誤，我不考慮（如 if、then、allOf 等）*/
        } else {
            /* 通常是 schema 非高等級的錯誤，這次的應用會是對應 properties 的內容 */
            let name = instancePath.slice(1)
            if (init.hasOwnProperty(name)) {
                init[name] += `,${message}`
            } else {
                init[name] = message
            }
        }
        return init
    }, {})
}

module.exports = async function (type, data) {
    const validate = VALIDATE[type]
    try {
        await validate(data)
        if (validate.errors) {
            let err = new Error()
            err.errors = validate.errors
            throw err
        }
        return null
    } catch ({ errors }) {
        return _handleErr(errors)
    }
}