import '../../../css/common/feedback.css'

export default function (targetEl, valid, msg) {
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
            .next()
                .addClass('loading')
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