/**
 * @description 環境變量
 */

const ENV = process.env.NODE_ENV

module.exports = {
    isNoCache: ENV === 'nocahce',
    isDev: ENV === 'dev',
    isProd: ENV === 'production'
}