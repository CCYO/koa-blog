/* 隱藏/顯示 */
export default function (q, boo = true) {
    return $(q).toggleClass('d-block', boo).toggleClass('d-none', !boo)
}