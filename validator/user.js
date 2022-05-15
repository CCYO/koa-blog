/**
 * @description validator JSON 4 user
 */

const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const ajvErr = require('ajv-errors')

const ajv = new Ajv({allErrors: true})

addFormats(ajv)
ajvErr(ajv)

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
            pattern: '^[\\w]+$',
            minLength: 2,
            maxLength: 20,
            errorMessage: {
                type: '暱稱必須由2~20個英文組成',
                pattern: '暱稱必須符合pattern',
                minLength: '暱稱必須>2個英文組成',
                maxLength: '暱稱必須<20個英文組成',
            }
        },
        password: {
            type: 'string',
            pattern: '^[\\w]+$',
            minLength: 3,
            maxLength: 32
        },
        age: {
            type: 'number',
            minimum: 1,
            maximum: 120,
        },
        avatar: {
            type: 'string',
            maxLength: 255,
        }
    }
}

const schema_register = { ...schema_common, required: ['email', 'password']}

const validator_user_register = (data) => {
    if(!ajv.validate(schema_register, data)){
        return ajv.errors
    }
    return null
}

const validator_user_update = (data) => {
    if(!ajv.validate(schema_common, data)){
        return ajv.errors
    }
    return null
}

module.exports = {
    validator_user_register,
    validator_user_update
}