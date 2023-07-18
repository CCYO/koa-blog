console.log('@initData loading....')
export default class {
    data = {}
    promises = []
    /**
     * 
     * @param {*} otherInitFn 用來取得頁面初使化所需數據，通常都是異步請求函數
     */
    async addOtherInitFn(otherInitFn) {
        /* 調用otherInitFn，並蒐集其生成的 promise */
        this.promises.push(otherInitFn())
    }
    async render(renderPage) {
        let allRes = await Promise.all(this.promises)
        for (let res of allRes) {
            for (let prop in res) {
                if (prop === 'news') {
                    continue
                }
                this.data[prop] = res[prop]
            }
        }
        if (renderPage) {
            await renderPage(this.data)
        }
    }
}