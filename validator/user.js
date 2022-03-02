/**
 * @description validator JSON 4 user
 */

const Ajv = require('ajv')

const ajv = new Ajv()

const schema = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            pattern: '^[\\w]+$',
            minLength: 2,
            maxLength: 20
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

const validator_user = (data) => {
    console.log('## ==> ', data)
    if(!ajv.validate(schema, data)){
        return ajv.errors
    }
    return null
}

module.exports = validator_user