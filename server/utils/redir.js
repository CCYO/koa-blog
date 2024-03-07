//  redirect login page
function login(href) {
  let url = new URL(href);
  let search = url.search;
  let from = encodeURIComponent(url.pathname + search);
  ctx.redirect(`/login?from=${from}`);
}

module.exports = {
  login,
};
