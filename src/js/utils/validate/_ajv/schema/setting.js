import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/setting.json`,
    type: 'object',
    allOf: [
        {
            minProperties: 2,
            properties: {
                $$me: {
                    type: 'object',
                    errorMessage: {
                        type: '$$me需是object'
                    }
                },
                email: {
                    noSpace: true,
                    diff: { $data: '1/$$me/email' },
                    $ref: 'defs.json#/definitions/email'
                },
                age: {
                    noSpace: true,
                    diff: { $data: '1/$$me/age' },
                    $ref: 'defs.json#/definitions/age'
                },
                nickname: {
                    noSpace: true,
                    diff: { $data: '1/$$me/nickname' },
                    $ref: 'defs.json#/definitions/nickname'
                },
                password: {
                    noSpace: true,
                    diff: { $data: '1/$$me/password' },
                    $ref: 'defs.json#/definitions/password'
                },
                avatar_hash: {
                    diff: { $data: '1/$$me/avatar_hash' },
                    $ref: 'defs.json#/definitions/avatar_hash'
                }
            },
            required: ['$$me'],
            errorMessage: {
                required: '必需有值',
                minProperties: '至少需改一筆資料',
            }
        },
        {
            properties: {
                password: {
                    $ref: 'defs.json#/definitions/password',
                    diff: { $data: '1/$$me/origin_password' }
                },
                password_again: { $ref: 'defs.json#/definitions/password_again' },
            },
            dependentRequired: {
                password: ['password_again', 'origin_password'],
                password_again: ['password', 'origin_password']
            },
            errorMessage: {
                dependentRequired: '必填'
            }
        },
    ],
    errorMessage: {
        type: '驗證數據必須是 object 格式',
    }
}

export default SCHEMA