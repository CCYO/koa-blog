import '../../../css/common/show.css'
/* 隱藏/顯示 */
export default function (q, boo = true) {
    return $(q).toggleClass('my-show', boo).toggleClass('my-noshow', !boo)
}