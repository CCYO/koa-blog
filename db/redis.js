console.log(123)
const redis = require('redis')

const cli = redis.createClient(6379, '127.0.0.1')
cli.connect()
cli.set('tt001', '0001', (e) => { console.log('SET ERR')})
cli.on('connect', () => console.log('Ok~') )
cli.on('error', () => console.log('NOOOOOOOOO') )