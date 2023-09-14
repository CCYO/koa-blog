const CONS = {
    REDIR_QUERY: 'from',
}

function redirForm(REDIR) {
    let searchParams = new URLSearchParams(location.search)
    if (!searchParams.size) {
        location.href = REDIR
    }
    let url = new URL(decodeURIComponent(searchParams.get(CONS.REDIR_QUERY)))
    let entries = [...url.searchParams.entries()]
    let dir = entries.reduce((acc, [key, value], index) => {
        let str = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        if (!index) {
            acc = `?${str}`
        } else {
            acc += `&${str}`
        }
        return acc
    }, '')
    location.href = url.pathname + dir
}

// export { redirForm }
export default redirForm