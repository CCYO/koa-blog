import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/register.json`,
    type: 'object',
    properties: {
        email: { 
            $ref: 'defs.json#/definitions/email',
            lock: { $data: '1/payload/email'}
        },
        password: { $ref: 'defs.json#/definitions/password' },
        password_again: { $ref: 'defs.json#/definitions/password_again' }
    },
    required: ['email', 'password', 'password_again'],
    errorMessage: {
        type: '必須是object',
        required: '必填'
    }
}

export default SCHEMA