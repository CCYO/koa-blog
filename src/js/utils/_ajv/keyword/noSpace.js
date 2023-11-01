function noSpace(schema, data, parentSchema, dataCtx) {
    if (!schema) {
        return true
    }
    let regux = /\s/g
    if (regux.test(data)) {
        let { instancePath } = dataCtx
        noSpace.errors = [{ instancePath, message: '不可包含空格' }]
        return false
    }
    return true
}
export default {
    keyword: 'noSpace',
    type: 'string',
    schemaType: 'boolean',
    validate: noSpace,
    errors: true
}