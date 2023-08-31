import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/isEmailExist.json`,
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
        type: '必須是object',
        required: '必填',
    }
}

export default SCHEMA