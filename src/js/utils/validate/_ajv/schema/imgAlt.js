import { CONST } from '../../../../../config/const'
const SCHEMA = {
    type: 'object',
    $id: `${CONST.URL}/blogImgAlt.json`,
    properties: {
        $$alt: {
            type: 'string',
            errorMessage: {
                type: '$$alt 必須是 string'
            }
        },
        alt: {
            $ref: 'defs.json#/definitions/blogImgAlt',
            diff: { $data: '1/$$alt' }
        },
        blog_id: {
            type: 'integer',
            minimum: 1,
            errorMessage: {
                type: '必須是整數',
                minimum: '必須 > 0'
            }
        },
        alt_id: {
            type: 'integer',
            minimum: 1,
            errorMessage: {
                type: '必須是整數',
                minimum: '必須 > 0'
            }
        }
    },
    required: ['$$alt', 'alt', 'blog_id', 'alt_id'],
    errorMessage: {
        type: '必須是object',
        require: '必需有值'
    }
}

export default SCHEMA