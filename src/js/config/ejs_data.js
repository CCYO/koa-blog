//  初始化數據
//  取得由 JSON.stringify(data) 轉譯過的純跳脫字符，
//  如 { html: `<p>56871139</p>`}
//     無轉譯 => { "html":"<p>56871139</p>") 會造成<p>直接渲染至頁面
//     轉譯 => {&#34;html&#34;:&#34;&lt;p&gt;56871139&lt}
const DATA_SET = "my-data";
const SELECTOR = `[data-${DATA_SET}]`;
const KEYS = {
  BLOG: "blog",
  ALBUM: "album",
};
const REG = {
  BLOG: {
    X_IMG:
      /<x-img.+?data-alt-id='(?<alt_id>\w+?)'.+?(data-style='(?<style>.+?)')?.*?\/>/g,
  },
};

export default {
  DATA_SET,
  SELECTOR,
  KEYS,
  REG,
};

export { DATA_SET, SELECTOR, KEYS, REG };
