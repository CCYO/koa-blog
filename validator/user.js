/**
 * @description validator JSON 4 user
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
            pattern: '^[\\u4e00-\\u9fa5a-zA-Z]+$',
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

const schema_register = { ...schema_common, required: ['email', 'password'] }

const validate_user_register = ajv.compile(schema_register)
const validate_user_update = ajv.compile(schema_common)


const validator_user_register = (data) => {
    let res = validate_user_register(data)
    console.log('@res => ', res)

    if (!res) {
        let errors = validate_user_update.errors
        console.log('@validator_user_update => ', validator_user_update)
        console.log('@validator_user_update.errors => ', errors)
        return errors
    }
    return false
}

const validator_user_update = (data) => {
    let res = validate_user_update(data)
    console.log('@res => ', res)

    if (!res) {
        let errors = validate_user_update.errors
        console.log('@validator_user_update => ', validator_user_update)
        console.log('@validator_user_update.errors => ', errors)
        return errors
    }
    return false
}

module.exports = {
    validator_user_register,
    validator_user_update
}