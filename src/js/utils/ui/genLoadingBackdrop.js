import '../../../css/utils/noClick.css'

const backdropClassName = 'loadingBackdrop'
const targetSelector = `input, a, button, *[tabindex]:not(#${backdropClassName})`
const blockClassName = 'noClick'

export default class {
    constructor(id = `#${backdropClassName}`) {
        this.$backdrop = $(id).first()
        this.$blockList = $(targetSelector)
        this.$backdrop.on('focus', (e) => {
            e.preventDefault()
            this.$backdrop.blur()
        })
    }
    editors = []
    hidden() {
        this.$blockList
            .removeClass(blockClassName)
            .off(`.${backdropClassName}`)
        this.$backdrop.removeAttr('style').hide()
        console.log('@this.editors => ', this.editors)
        if (this.editors.length) {
            for (editor of this.editors) {
                editor.enable()
            }
        }
        console.log('backdrop hidden')
    }
    show(config = { blockPage: false, ediotrs: [] }) {
        const {
            blockPage = false,
            editors = []
        } = config
        if (!blockPage) {
            this.$backdrop.css('visibility', 'hidden')
        }
        if (editors.length) {
            this.insertEditors(editors)
        }
        for (editor of this.editors) {
            ediotr.disable()
        }
        this.$backdrop.show()
        this.$blockList
            .addClass(blockClassName)
            .on(`focus.${backdropClassName}`, (e) => this.focusBackdrop(e))
    }
    insertEditors(editors){
        this.editors = this.editors.concat(editors)
    }
    focusBackdrop(e) {
        e.preventDefault()
        this.$backdrop.focus()
    }
}