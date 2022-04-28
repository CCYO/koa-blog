/**
 * @description validator JSON 4 user
 */

const Ajv = require('ajv')

const ajv = new Ajv()

const schema_common = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            pattern: '^[\\w]+@[\\w.]+$'
        },
        nickname: {
            type: 'string',
            pattern: '^[\\w]+$',
            minLength: 2,
            maxLength: 20
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