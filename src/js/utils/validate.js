console.log('@validate loading...')
import Ajv2019 from "ajv/dist/2019"
import addFormats from 'ajv-formats'
import errors from 'ajv-errors'
import _axios from './_axios'

import SERVER_CONST from '../../../server/conf/constant'

const ajv = new Ajv2019({
    strict: false,
    allErrors: true,
    $data: true
})

addFormats(ajv)
//  為 ajv 添加 format 關鍵字，僅適用 string 與 number
errors(ajv)
//  可使用 errorMessage 自定義錯誤提示
ajv.addKeyword({
    keyword: 'isEmailExist',
    async: true,
    type: 'string',
    schemaType: 'boolean',
    validate: isEmailExist,
    errors: true
})
ajv.addKeyword({
    keyword: 'diff',
    $data: true,
    type: ['string', 'number', 'boolean'],
    schemaType: ['string', 'number', 'boolean', 'null'],
    validate: diff,
    errors: true
})
ajv.addKeyword({
    keyword: 'confirmPassword',
    type: 'string',
    async: true,
    schemaType: 'boolean',
    validate: confirmPassword,
    errors: true
})
ajv.addKeyword({
    keyword: 'noSpace',
    type: 'string',
    schemaType: 'boolean',
    validate: noSpace,
    errors: true
})

const CONST = {
    BLOG: {
        HTML_MAX_LENGTH: SERVER_CONST.BLOG.HTML_MAX_LENGTH,
        HTML_MIN_LENGTH: SERVER_CONST.BLOG.HTML_MIN_LENGTH
    },
    URL: 'http://my.ajv.schema',
    VALIDATE: {
        DEFS: 'defs',
        EMAIL: 'email',
        REGISTER: 'register',
        LOGIN: 'login',
        PASSWORD: 'password',
        AVATAR: 'avatar',
        SETTING: 'setting',
        BLOG: 'blog'
    },
    API: {
        EMAIL: '/api/user/isEmailExist',
        PASSWORD: '/api/user/confirmPassword'
    }
}

const SCHEMA = {
    [CONST.VALIDATE.DEFS]: {
        $id: `${CONST.URL}/defs.json`,
        definitions: {
            email: {
                type: 'string',
                format: 'email',
                errorMessage: {
                    type: '必須是字符串',
                    format: '必須是電子信箱格式'
                }
            },
            nickname: {
                type: 'string',
                pattern: '^[\\u4e00-\\u9fa5a-zA-Z\\d]+$',
                maxLength: 20,
                errorMessage: {
                    type: '必須是字符串',
                    pattern: '必須由英文、數字以及底線組成',
                    maxLength: '長度需小於20個字'
                }
            },
            origin_password: {
                type: 'string',
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
            password: {
                type: 'string',
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
                pattern: '^[\\w]+$',
                minLength: 6,
                maxLength: 32,
                errorMessage: {
                    type: '必須是字符串',
                    const: '請再次確認密碼是否相同',
                    pattern: '必須由英文、數字以及底線組成',
                    minLength: '長度須介於6-32個字符',
                    maxLength: '長度須介於6-32個字符'
                }
            },
            age: {
                type: 'number',
                minimum: 1,
                maximum: 120,
                errorMessage: {
                    type: '必須是數字',
                    minimum: '必需介於1-120之間',
                    maximum: '必需介於1-120之間'
                }
            },
            avatar: {
                type: 'string',
                format: 'binary',
                errorMessage: {
                    type: '必須是string',
                    format: '頭像資料需符合url格式'
                }
            },
            avatar_hash: {
                type: 'string',
                errorMessage: 'avatar_hash必須是字符串'
            },
            title: {
                type: 'string',
                maxLength: 20,
                minLength: 1,
                errorMessage: {
                    type: '必須是字符串',
                    maxLength: '長度需小於20個字',
                    minLength: '長度需大於1個字',
                }
            },
            html: {
                type: 'string',
                maxLength: CONST.BLOG.HTML_MAX_LENGTH,
                minLength: CONST.BLOG.HTML_MIN_LENGTH,
                errorMessage: {
                    type: '必須是字符串',
                    maxLength: '長度需小於65536個字',
                    minLength: '長度需大於1個字',
                }
            },
            show: {
                type: 'boolean',
                errorMessage: {
                    type: '必須是boolean'
                }
            },
            cancelImgs: {
                type: 'object',
                properties: {
                    blogImg_id: {
                        type: 'integer',
                        errorMessage: {
                            type: '只能是整數'
                        }
                    },
                    blogImgAlt_list: {
                        type: 'array',
                        minItems: 1,
                        uniqueItems: true,
                        items: {
                            type: 'integer',
                            errorMessage: {
                                type: '只能是整數'
                            }
                        },
                        errorMessage: {
                            type: '必須是array',
                            minItems: '不能為空',
                            uniqueItems: '不該有重複的值'
                        }
                    }
                },
                required: ['blogImg_id', 'blogImgAlt_list'],
                additionalProperties: false,
                errorMessage: {
                    type: '必須是object',
                    required: '必須包含blogImg_id與blogImgAlt_list數據',
                    additionalProperties: '不允許除了blogImg_id與blogImgAlt_list以外的數據'
                }
            },
        }
    },
    [CONST.VALIDATE.EMAIL]: {
        $id: `${CONST.URL}/email.json`,
        $async: true,
        type: 'object',
        if: {
            properties: {
                email: { $ref: 'defs.json#/definitions/email' },
            },
            required: ['email'],
        },
        then: {
            properties: {
                email: {
                    type: 'string',
                    isEmailExist: true,
                }
            }
        },
        else: {
            $ref: '#/if'
        },
        errorMessage: {
            required: '必填'
        }
    },
    [CONST.VALIDATE.REGISTER]: {
        $id: `${CONST.URL}/register.json`,
        type: 'object',
        properties: {
            email: { $ref: 'defs.json#/definitions/email' },
            password: { $ref: 'defs.json#/definitions/password' },
            password_again: { $ref: 'defs.json#/definitions/password_again' }
        },
        required: ['email', 'password', 'password_again'],
        errorMessage: {
            required: '必填'
        }
    },
    [CONST.VALIDATE.LOGIN]: {
        $id: `${CONST.URL}/login.json`,
        type: 'object',
        properties: {
            email: { $ref: 'defs.json#/definitions/email' },
            password: { $ref: 'defs.json#/definitions/password' }
        },
        required: ['email', 'password'],
        errorMessage: {
            required: '必填'
        }
    },
    [CONST.VALIDATE.PASSWORD]: {
        $id: `${CONST.URL}/password.json`,
        $async: true,
        type: 'object',
        if: {
            properties: {
                origin_password: {
                    $ref: 'defs.json#/definitions/password'
                },
            },
            required: ['origin_password'],
        },
        then: {
            properties: {
                origin_password: {
                    confirmPassword: true
                },
            },
            required: ['origin_password'],
        },
        else: {
            $ref: '#/if'
        },
        errorMessage: {
            required: '必填',
        }
    },
    [CONST.VALIDATE.AVATAR]: {
        $id: `${CONST.URL}/avatar.json`,
        type: 'object',
        properties: {
            avatar_base64: {
                format: 'byte',
                errorMessage: {
                    format: '非base64編碼'
                }
            },
            avatar_hash: {
                diff: { $data: '1/$$me/avatar_hash' },
                $ref: 'defs.json#/definitions/avatar_hash'
            }
        },
        required: ['avatar_base64', 'avatar_hash'],
        errorMessage: {
            required: '必填',
        }
    },
    [CONST.VALIDATE.SETTING]: {
        $id: `${CONST.URL}/setting.json`,
        type: 'object',
        allOf: [
            {
                minProperties: 2,
                properties: {
                    $$me: {
                        type: 'object',
                        errorMessage: {
                            type: '$$me需是object'
                        }
                    },
                    email: {
                        noSpace: true,
                        diff: { $data: '1/$$me/email' },
                        $ref: 'defs.json#/definitions/email'
                    },
                    age: {
                        noSpace: true,
                        diff: { $data: '1/$$me/age' },
                        $ref: 'defs.json#/definitions/age'
                    },
                    nickname: {
                        noSpace: true,
                        diff: { $data: '1/$$me/nickname' },
                        $ref: 'defs.json#/definitions/nickname'
                    },
                    password: {
                        noSpace: true,
                        diff: { $data: '1/$$me/password' },
                        $ref: 'defs.json#/definitions/password'
                    },
                    avatar_hash: {
                        diff: { $data: '1/$$me/avatar_hash' },
                        $ref: 'defs.json#/definitions/avatar_hash'
                    }
                },
                required: ['$$me'],
                errorMessage: {
                    required: '必需有值',
                    minProperties: '至少需改一筆資料',
                }
            },
            {
                properties: {
                    password: {
                        $ref: 'defs.json#/definitions/password',
                        diff: { $data: '1/$$me/origin_password' }
                    },
                    password_again: { $ref: 'defs.json#/definitions/password_again' },
                },
                dependentRequired: {
                    password: ['password_again', 'origin_password'],
                    password_again: ['password', 'origin_password']
                },
                errorMessage: {
                    dependentRequired: '必填'
                }
            },
        ],
        errorMessage: {
            type: '驗證數據必須是 object 格式',
        }
    },
    [CONST.VALIDATE.BLOG]: {
        $id: `${CONST.URL}/blog.json`,
        type: 'object',
        minProperties: 2,
        properties: {
            $$blog: {
                type: 'object',
                errorMessage: {
                    type: '$$blog需是object'
                }
            },
            title: {
                $ref: 'defs.json#/definitions/title',
                diff: { $data: '1/$$blog/title' }
            },
            html: {
                $ref: 'defs.json#/definitions/html',
                diff: { $data: '1/$$blog/html' }
            },
            show: {
                $ref: 'defs.json#/definitions/show',
                diff: { $data: '1/$$blog/show' }
            },
            cancelImgs: {
                $ref: 'defs.json#/definitions/cancelImgs'
            }
        },
        required: ['$$blog'],
        errorMessage: {
            required: '必需有值',
            minProperties: '至少需改一筆資料',
        }
    }
}
ajv.addSchema(SCHEMA[CONST.VALIDATE.DEFS])

function validateUserData(schemaName) {
    let validate = ajv.compile(SCHEMA[schemaName])
    return async (data) => {
        try {
            await validate(data)
            if (validate.errors) {
                let e = new Error()
                e.errors = validate.errors
                throw e
            }
            return null
        } catch (err) {
            let { errors } = err
            if (errors) {
                return handleErr(errors)
            } else {
                throw err
            }
        }
    }
}

function validateBlogData(schemaName) {
    let validate = ajv.compile(SCHEMA[schemaName])
    return async (data) => {
        try {
            await validate(data)
            if (validate.errors) {
                let e = new Error()
                e.errors = validate.errors
                throw e
            }
            return null
        } catch (err) {
            let { errors } = err
            if (errors) {
                return handleBlogErr(errors)
            } else {
                throw err
            }
        }
    }
}

function handleBlogErr(validateErrors) {
    /*{ 
        errors: [ { ..., message: 自定義的錯誤說明, ... }, ...],
      }*/
    console.log('@validate handle 要處理的 errors => ', validateErrors)
    return validateErrors.reduce((init, validateError) => {
        let { params, keyword, instancePath, message } = validateError
        if (!instancePath) {
            /* 通常是 schema 最高等級的錯誤，換句話說，通常不會是 data 上能查詢到的 keyword（如　required || if || then 等） */
            if (keyword === 'errorMessage') {
                /* 已被 ajv-errors 捕獲的錯誤 */
                let { errors } = params
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

function handleErr(validateErrors) {
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
function noSpace(schema, data, parentSchema, dataCtx) {
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
}
async function confirmPassword(schema, origin_password, parentSchema, dataCtx) {
    if (!schema) {
        return true
    }
    let payload = { origin_password: origin_password }
    let { errno, msg } = await _axios.post(CONST.API.PASSWORD, payload)
    if (errno) {
        let { instancePath } = dataCtx
        let e = new Error()
        e.errors = [{ instancePath, message: msg }]
        throw e
    }
    return true
}
function diff(schema, data, parentSchema, dataCtx) {
    if (schema !== data) {
        return true
    }
    let { instancePath } = dataCtx
    diff.errors = [{ instancePath, message: '若沒有要異動就別鬧', keyword: 'diff' }]
    return false
}
async function isEmailExist(schema, data, parentSchema, dataCtx) {
    if (!schema) {
        return true
    }
    const key = 'email'
    let { errno, msg } = await _axios.post('/api/user/isEmailExist', { [key]: data })
    if (errno) {
        let { instancePath } = dataCtx
        let e = new Error()
        let message = msg[key]
        e.errors = [{ instancePath, message }]
        throw e
    }
    return true
}

export default {
    [CONST.VALIDATE.EMAIL]: validateUserData(CONST.VALIDATE.EMAIL),
    [CONST.VALIDATE.REGISTER]: validateUserData(CONST.VALIDATE.REGISTER),
    [CONST.VALIDATE.LOGIN]: validateUserData(CONST.VALIDATE.LOGIN),
    [CONST.VALIDATE.PASSWORD]: validateUserData(CONST.VALIDATE.PASSWORD),
    [CONST.VALIDATE.AVATAR]: validateUserData(CONST.VALIDATE.AVATAR),
    [CONST.VALIDATE.SETTING]: validateUserData(CONST.VALIDATE.SETTING),
    [CONST.VALIDATE.BLOG]: validateBlogData(CONST.VALIDATE.BLOG)
}