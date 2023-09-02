function dev_log(...msg){
    if(process.env.NODE_ENV !== 'development'){
        return
    }
    console.log('【測試提醒】\n', ...msg)
}

export default {
    dev_log
}

export {
    dev_log
}