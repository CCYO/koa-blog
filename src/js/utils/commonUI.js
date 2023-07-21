console.log('@commonUI loading...')
/* 顯示/隱藏 讀取遮罩 的 工廠函數 */

let $pageLoading = $('#pageLoading')
$pageLoading.on('focus', (e) => {
    e.preventDefault()
    console.log('@阻擋成功')
    e.target.blur()
})
function focusBackdrop(e){
        e.preventDefault()
        console.log('@被擋 ---> ', e.target)
        $pageLoading[0].focus()
}
function Backdrop(){
    $pageLoading.addClass('pageLoading').show()
    $('input, a, button, *[tabindex]:not(#pageLoading)').addClass('noClick').on('focus', focusBackdrop)
}
function clearBackdrop(){
    $pageLoading.addClass('pageLoading').hide()
    $('input, a, button, *[tabindex]:not(#pageLoading)').removeClass('noClick').off('focus', focusBackdrop)
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