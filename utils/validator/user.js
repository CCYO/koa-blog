/**
 * @description 校驗 user 的 資料格式
 */

const Ajv = require("ajv").default
const addFormats = require('ajv-formats')
const errors = require("ajv-errors")

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
errors(ajv)

const schema_common = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            errorMessage: 'email必須是電子信箱格式'
        },
        nickname: {
            type: 'string',
            // pattern: '^[\\w]+$',
            pattern: '^[\\u4e00-\\u9fa5a-zA-Z\\d]+$',
            maxLength: 20,
            errorMessage: '必須是英文、數字以及底線組成，必須小於20個字符'
        },
        password: {
            type: 'string',
            pattern: '^[\\w]+$',
            minLength: 6,
            maxLength: 32,
            errorMessage: '必須是英文、數字以及底線組成，長度須介於6-32個字符'
        },
        age: {
            type: 'number',
            minimum: 1,
            maximum: 120,
            errorMessage: '必須是數字，介於1-120之間'
        },
        avatar: {
            type: 'string',
            errorMessage: '必須是string'
        },
        avatar_hash: {
            type: 'string',
            errorMessage: '必須是string'
        }
    }
}

const schema_isEmailExist = {
    ...schema_common,
    required: ['email'],
    errorMessage: {
        required: 'email 必須有值'
    }
}

const schema_register = {
    ...schema_common,
    required: ['email', 'password'],
    errorMessage: {
        required: 'email 與 password 都必須有值'
    }
}

const validate_email = ajv.compile(schema_isEmailExist)
const validate_register = ajv.compile(schema_register)
const validate_update = ajv.compile(schema_common)

function validator_user(type, data) {
    let validator
    switch (type) {
        case 'email':
            validator = validate_email
            break;
        case 'register':
            validator = validate_register
            break;
        case 'update':
            validator = validate_update
            break;
    }
    
    if (!validator(data)) {
        return validator.errors
    }
    return null
}

module.exports = validator_user