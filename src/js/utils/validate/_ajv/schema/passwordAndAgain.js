import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/passwordAndAgain.json`,
    type: 'object',
    properties: {
        password: { $ref: 'defs.json#/definitions/password' },
        password_again: { $ref: 'defs.json#/definitions/password_again' }
    },
    required: ['password', 'password_again'],
    additionalProperties: false,
    errorMessage: {
        type: '必須是object',
        required: '必填',
        additionalProperties: '屬於非法數據'
    }
}

export default SCHEMA