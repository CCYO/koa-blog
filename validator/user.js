/**
 * @description validator JSON 4 user
 */

const Ajv = require("ajv").default
const ajv = new Ajv({ allErrors: true })
require("ajv-errors")(ajv /*, {singleError: true} */)
//const addFormats = require('ajv-formats')




//addFormats(ajv)


const schema_common = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            //format: 'email',
            errorMessage: 'email必須是電子信箱格式'
        },
        nickname: {
            type: 'number',
            //pattern: '^[\\w]+$',
            minLength: 10,
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
        },
    },
    errorMessage: '到底哪裡有問題?',
}

const schema_register = { ...schema_common, required: ['email', 'password'] }

const validate_user_update = ajv.compile(schema_common)

const validator_user_register = (data) => {
    if (!ajv.validate(schema_register, data)) {
        return ajv.errors
    }
    return null
}

const validator_user_update = (data) => {
    // console.log('@data => ', data)
    // if(validate_user_update(data)){
    //     console.log('@data => ', data) 
    // }else{
    //     console.log('@errors => ', validate_user_update.errors)
    // }
    let res = validate_user_update(data)
    console.log('@res => ', res)

    if (!res) {
        let res = validate_user_update.errors
        console.log('@validator_user_update => ', validate_user_update)
        console.log('@validator_user_update.errors => ', res)
        return res
    }
    return false
}

module.exports = {
    validator_user_register,
    validator_user_update
}