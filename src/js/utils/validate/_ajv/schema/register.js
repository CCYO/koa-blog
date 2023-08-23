import { CONST } from '../../../../../config/const'
const SCHEMA = {
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
}

export default SCHEMA