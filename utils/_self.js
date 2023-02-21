function getOnePropValue(arr, prop){
    return arr.map( item => item[prop])
}

module.exports = {
    getOnePropValue
}