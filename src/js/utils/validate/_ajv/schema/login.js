import { CONST } from '../../../../../config/const'
const SCHEMA = {
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
}
export default SCHEMA