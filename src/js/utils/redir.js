const API_LOGIN = "/login";
const REDIR = "from";

function from(url) {
  let searchParams = new URLSearchParams(location.search);
  if (searchParams.size) {
    //  searchParams 取得的query，已經完成decodeURIComponent
    url = searchParams.get(REDIR);
  }
  location.replace(url);
}

function check_login(data) {
  let login = data && data.me && data.me.id;
  if (login) {
    return true;
  }
  /* 若未登入，跳轉到登入頁 */
  alert(`請先登入`);
  location.href = `${API_LOGIN}?${REDIR}=${encodeURIComponent(location.href)}`;
  return false;
}

export { from, check_login };
export default { from, check_login };
