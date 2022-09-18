console.log('public logout')
$('#logout').click(logout)

// 登出
async function logout(e) {
    e.preventDefault()

    if (!confirm('真的要登出嗎?')) {
        return alert('對拉，多待一下拉')
    }

    const {
        data: {
            errno,
            data,
            msg
        }
    } = await axios.get('/api/user/logout')

    if (!errno) {
        alert(data)
        location.href = '/login'
    }
}