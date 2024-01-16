import { isProd } from "~/server/config/env";

function dev(...msg) {
  if (isProd) {
    return;
  }
  console.log("【測試提醒】\n", ...msg);
}

export default {
  dev,
};

export { dev };
