function dev(...msg) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  console.log("【測試提醒】\n", ...msg);
}

export default {
  dev,
};

export { dev };
