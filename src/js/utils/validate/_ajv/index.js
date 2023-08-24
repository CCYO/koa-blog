/* -------------------- NPM MODULE -------------------- */
import Ajv2019 from "ajv/dist/2019"
import addFormats from 'ajv-formats'
import errors from 'ajv-errors'
/* -------------------- Utils MODULE -------------------- */
import _axios from '../../_axios'


import { diff, confirmPassword, isEmailExist, noSpace } from './keyword'
import { DEF } from './schema'
/* -------------------- RUN -------------------- */
const ajv = new Ajv2019({
    strict: false,
    allErrors: true,
    $data: true
})
//  建立ajv instance
addFormats(ajv)
//  為 ajv 添加 format 關鍵字，僅適用 string 與 number
errors(ajv)
//  添加功能：errorMessage 自定義錯誤提示
/* -------------------- 新增關鍵字 -------------------- */
/* email是否已被註冊 */
ajv.addKeyword(isEmailExist)
/* 數據是否與當前值相同 */
ajv.addKeyword(diff)
/* password是否正確匹配 */
ajv.addKeyword(confirmPassword)
/* 數據是否不含空格 */
ajv.addKeyword(noSpace)
ajv.addSchema(DEF)
//  添加基本定義schema

export default ajv