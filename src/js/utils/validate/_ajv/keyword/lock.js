function lock(schema, data, parentSchema, dataCtx) {
    //  schema 是 map
    if (schema !== data) {
        return false
    }
    let entries = Object.entries(data)
    for(let [key, value] of entries){
        schema.
    }
    
    let { instancePath } = dataCtx
    diff.errors = [{ instancePath, message: '若沒有要更新就別鬧', keyword: 'diff' }]
    return false
}
export default {
    keyword: 'lock',
    $data: true,
    type: object,
    schemaType: object,
    validate: lock,
    errors: true
}