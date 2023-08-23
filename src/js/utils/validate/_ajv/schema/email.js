import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/email.json`,
    $async: true,
    type: 'object',
    if: {
        properties: {
            email: { $ref: 'defs.json#/definitions/email' },
        },
        required: ['email'],
    },
    then: {
        properties: {
            email: {
                type: 'string',
                isEmailExist: true,
            }
        }
    },
    else: {
        $ref: '#/if'
    },
    errorMessage: {
        required: '必填'
    }
}

export default SCHEMA