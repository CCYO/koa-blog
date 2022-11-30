window._my.promiseAll.push( initData() )

async function initData() {
    let api = '/api/user'
    let { data: { errno, data } } = await axios.get(api)
    let pathname = location.pathname
    if (errno && ( pathname === '/self' || pathname === '/setting' )) {
        location.pathname = '/login'
        return
    }
    window.data.me = {}
    if (!errno) {
        window.data.me = data
        console.log('@ window.data.me finish ')
    } else {
        console.log('@ 未登入狀態 ')
    }
    console.log('@ getMe.js --- ok')
}
