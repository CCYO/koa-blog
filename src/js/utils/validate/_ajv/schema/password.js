import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/password.json`,
    $async: true,
    type: 'object',
    if: {
        properties: {
            origin_password: {
                $ref: 'defs.json#/definitions/password'
            },
        },
        required: ['origin_password'],
    },
    then: {
        properties: {
            origin_password: {
                confirmPassword: true
            },
        },
        required: ['origin_password'],
    },
    else: {
        $ref: '#/if'
    },
    errorMessage: {
        required: '必填',
    }
}

export default SCHEMA