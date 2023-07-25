console.log('@commonUI loading...')
/* 顯示/隱藏 讀取遮罩 的 工廠函數 */
import '../../css/utils/noClick.css'
import '../../css/common/loadingBackdrop.css'

import '../../css/common/feedback.css'

const backdropClassName = 'loadingBackdrop'
const targetSelector = `input, a, button, *[tabindex]:not(#${backdropClassName})`
const blockClassName = 'noClick'

export class genLoadingBackDrop {
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

export function feedback(targetEl, valid, msg) {
    //  清空form
    //  input 讀取中
    //  input 有效
    //  input 無效

    if (targetEl.tagName === 'FORM') {
        for (let inp of targetEl) {
            $(inp)
            .removeClass('is-invalid is-valid')
            .next()
                .removeClass('invalid-feedback valid-feedback loading')
                .text('')
        }
    } else if (!valid && !msg) {
        //  驗證中
        $(targetEl)
            .addClass('is-valid')
            .next()
                .addClass('valid-feedback loading')
                .text('loading...')
    } else {
        //  驗證結束
        $(targetEl)
            .removeClass(valid ? 'is-invalid' : 'is-valid')
            .addClass( valid ? 'is-valid' : 'is-invalid' )
            .next()
                .removeClass(( valid ? 'invalid-feedback' : 'valid-feedback') + ' loading')
                .addClass(valid ? 'valid-feedback' : 'invalid-feedback').text(msg)
    }
}

















export function genBackdrop() {
    let originalEnableInps = []
    return {
        loading(editorList = []) {
            Backdrop()
            return
            /*
            頁面讀取中，禁止任何點擊、tab獲取焦點
            */
            $('.backdrop').removeClass('my-noshow')
            $('.pageLoading').show()
            //  顯示 backdrop
            $('*').on('keydown', EventPrevent)
            //  取消任何鍵盤可能發生的默認行為，這裡主要是要取消 tab 選取
            $('body').css('pointer-events', 'none')
            //  取消頁面任何點擊行為
            for (let input of $('input')) {
                /* 防止 input 觸發 */
                let $input = $(input)
                if ($input.prop('disabled')) {
                    continue
                }
                $input.prop('disabled', true)
                //  限制原本可運作的 input
                originalEnableInps.push($input)
                //  納入管理    
            }
            editorList.forEach(editor => editor.disable())
            //  防止 editor 被觸發
        },
        loadEnd(editorList = []) {
            clearBackdrop()
            return
            /*
            頁面讀取結束，允許點擊、tab獲取焦點
            */
            $('.backdrop').addClass('my-noshow')
            //  隱藏 backdrop
            $('*').off('keydown', EventPrevent)
            //  允許任何鍵盤可能發生的默認行為，這裡主要是要取消 tab 選取
            $('body').css('pointer-events', 'auto')
            //  允許頁面任何點擊行為
            for (let $input of originalEnableInps) {
                $input.prop('disabled', false)
            }
            originalEnableInps = []
            //  清空要被禁止的input
            editorList.forEach(editor => editor.enable())
            //  允許 editor 被觸發
        }
    }
    function EventPrevent(e) {
        /* 取消任何鍵盤可能發生的默認行為，這裡主要是要取消 tab 選取 */
        e.preventDefault()
    }
}

/* 隱藏/顯示 */
export function show(q, boo = true) {
    return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
}