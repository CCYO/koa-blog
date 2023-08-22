import '../../css/utils/noClick.css'
import '../../css/wedgets/loadingBackdrop.css'
const backdropClassName = '#loadingBackdrop'
const targetSelector = `input, a, button, *[tabindex]:not(${backdropClassName})`
const blockClassName = 'noClick'

export default class {
    constructor(id = `${backdropClassName}`) {
        this.$backdrop = $(id)
        this.$backdrop.on('focus', (e) => {
            e.preventDefault()
            this.$backdrop.get(0).blur()
        })
    }
    editors = []
    hidden() {
        $(targetSelector)
            .removeClass(blockClassName)
            //  取消blockList不可被點擊的狀態
            .off(backdropClassName)
            //  移除指定的事件綁定
        this.$backdrop.removeAttr('style').hide()
        if (this.editors.length) {
            for (let editor of this.editors) {
                editor.enable()
            }
        }
        console.log('backdrop hidden')
    }
    //  顯示dropBack
    show(config = { blockPage: false, ediotrs: [] }) {
        const {
            blockPage = false,
            //  是否顯示頁面遮罩
            editors = []
            //  要新添加的wangEditor list
        } = config
        if (!blockPage) {
            this.$backdrop.css('visibility', 'hidden')
            //  不顯示頁面遮罩，將其顯示為不可見(實際上仍存在)
        }
        if (editors.length) {
            this.insertEditors(editors)
            //  存入this.editors
        }
        for (let editor of this.editors) {
            editor.disable()
            //  關閉所有editor作用
        }
        this.$backdrop.show()
        //  放上遮罩
        $(targetSelector)
            .addClass(blockClassName)
            //  使blockList不可被點擊
            .on(`focus.${backdropClassName}`, (e) => this.focusBackdrop(e))
            //  focus事件綁定(且用上jq語法糖，賦予綁定事件一個指定名稱，方便後續取消綁定)
            //  handle 讓所有 blockList 發生聚焦時，統一將聚焦轉移至 backdrop
        console.log('backdrop show')
    }
    insertEditors(editors) {
        this.editors = this.editors.concat(editors)
        //  存入this.editors
    }
    /* 統一 focus backdrop */
    focusBackdrop(e) {
        e.preventDefault()
        this.$backdrop.get(0).focus()
        //  聚焦到 backdrop
    }
}