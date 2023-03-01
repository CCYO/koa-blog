/**
 * @description 環境變量
 */

const ENV = process.env.NODE_ENV

console.log('@ENV => ', ENV)

module.exports = {
    isNoCache: ENV === 'nocache',
    isDev: ENV === 'dev',
    isProd: ENV === 'production'
}