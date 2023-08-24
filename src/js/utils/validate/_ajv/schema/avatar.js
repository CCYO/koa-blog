import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/avatar.json`,
    type: 'object',
    properties: {
        avatar_base64: {
            format: 'byte',
            errorMessage: {
                format: '非base64編碼'
            }
        },
        avatar_hash: {
            diff: { $data: '1/$$me/avatar_hash' },
            $ref: 'defs.json#/definitions/avatar_hash'
        }
    },
    required: ['avatar_base64', 'avatar_hash'],
    errorMessage: {
        required: '必填',
    }
}

export default SCHEMA