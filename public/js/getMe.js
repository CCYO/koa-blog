window._my.promiseIns.getMe = initData().then(({ errno, data, msg }) => {
    window.data.me = {}
    if (!errno) {
        window.data.me = data
        console.log('@ window.data.me finish ')
        console.log('@ getMe.js --- ok')
        return
    }
    console.log('@ 未登入狀態 ')
    
    let pathname = location.pathname
    if ( pathname === '/self' || pathname === '/setting') {
        location.pathname = '/login'
    }
})
.catch(e => console.log(e))

window._my.promiseAll.push(window._my.promiseIns.getMe)

async function initData() {
    let api = '/api/user'
    let { data } = await axios.get(api)
    return data
}
