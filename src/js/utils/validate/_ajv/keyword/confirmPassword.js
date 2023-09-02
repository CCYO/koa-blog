import _axios from '../../../_axios'
async function confirmPassword(schema, origin_password, parentSchema, dataCtx) {
    if (!schema) {
        return true
    }
    let payload = { origin_password }
    let { errno, msg } = await _axios.post(CONST.API.PASSWORD, payload)
    if (errno) {
        let { instancePath } = dataCtx
        let keyword = 'confrimPassword'
        let params = { myKeyword: true }
        //  提供給 ../index 的 _parseValidateErrors 判別是否為我定義的 keyword
        let e = new Error()
        e.errors = [{ keyword, instancePath, params, message: msg }]
        throw e
    }
    return true
}
export default {
    keyword: 'confirmPassword',
    type: 'string',
    async: true,
    schemaType: 'boolean',
    validate: confirmPassword,
    errors: true
}