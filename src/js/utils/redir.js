import { PAGE, REDIR } from "../../js/config";

function from(url) {
  let searchParams = new URLSearchParams(location.search);
  if (searchParams.size) {
    url = decodeURIComponent(searchParams.get(REDIR.FROM));
  }
  location.href = url;
}

function check_login(data) {
  let login = data.me ? data.me.id : false;
  if (login) {
    return true;
  }
  /* 若未登入，跳轉到登入頁 */
  alert(`請先登入`);
  location.href = `${PAGE.REGISTER_LOGIN.VIEW.LOGIN}?${
    REDIR.FROM
  }=${encodeURIComponent(location.href)}`;
  return false;
}

export { from, check_login };
export default { from, check_login };
