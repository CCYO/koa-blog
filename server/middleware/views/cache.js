async function static(ctx, next) {
  if (ctx.session.user) {
    return ctx.redirect("/self");
  }
  let ifNoneMatch = ctx.headers["if-none-match"];
  let etag = "abcde";
  if (ifNoneMatch === etag) {
    ctx.status = 304;
    return;
  }
  await next();

  ctx.set({
    etag,
    ["Cache-Control"]: "no-cache",
  });
}
module.exports = {
  static,
};
