import { CONST } from '../../../../../config/const'
const SCHEMA = {
    $id: `${CONST.URL}/blog.json`,
    type: 'object',
    minProperties: 2,
    properties: {
        $$blog: {
            type: 'object',
            errorMessage: {
                type: '$$blog需是object'
            }
        },
        title: {
            $ref: 'defs.json#/definitions/title',
            diff: { $data: '1/$$blog/title' }
        },
        html: {
            $ref: 'defs.json#/definitions/html',
            diff: { $data: '1/$$blog/html' }
        },
        show: {
            $ref: 'defs.json#/definitions/show',
            diff: { $data: '1/$$blog/show' }
        },
        cancelImgs: {
            $ref: 'defs.json#/definitions/cancelImgs'
        }
    },
    required: ['$$blog'],
    errorMessage: {
        required: '必需有值',
        minProperties: '至少需改一筆資料',
    }
}

export default SCHEMA