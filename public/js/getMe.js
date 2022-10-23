window._myPromiseIns.getMe = initData().then(({ errno, data, msg }) => {
    if (!errno) {
        window.data.me = data
        console.log('@ window.data.me finish ')
        console.log('@ getMe.js --- ok')
        return
    }
    console.log(msg)
    let pathname = location.pathname
    if ( pathname === '/self' || pathname === '/setting') {
        location.pathname = '/login'
    }
})
.catch(e => console.log(e))

window._my_promise_all.push(window._myPromiseIns.getMe)

async function initData() {
    let api = '/api/user'
    let { data } = await axios.get(api)
    return data
}
