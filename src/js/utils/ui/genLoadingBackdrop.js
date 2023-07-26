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
    hidden() {
        this.$blockList
            .removeClass(blockClassName)
            .off(`.${backdropClassName}`)
        this.$backdrop.removeAttr('style').hide()
        console.log('backdrop hidden')
    }
    show(blockPage = false) {
        if(!blockPage){
            this.$backdrop.css('visibility', 'hidden')
        }
        this.$backdrop.show()
        this.$blockList
            .addClass(blockClassName)
            .on(`focus.${backdropClassName}`, (e) => this.focusBackdrop(e))
    }
    focusBackdrop(e) {
        e.preventDefault()
        this.$backdrop.focus()
    }
}