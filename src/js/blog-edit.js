/* ------------------------------------------------------------------------------------------ */
/* EJS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  import("../views/pages/blog-edit/index.ejs");
}
/* ------------------------------------------------------------------------------------------ */
/* CSS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "@css/blog-edit.css";
import "@wangeditor/editor/dist/css/style.css";

/* ------------------------------------------------------------------------------------------ */
/* NPM Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import SparkMD5 from "spark-md5";
import {
  i18nAddResources,
  i18nChangeLanguage,
  createToolbar,
  createEditor,
} from "@wangeditor/editor";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
  common as $M_Common,
  G,
  _ajv as $C_ajv,
  Debounce as $C_Debounce,
  _xss as $M_xss,
  ui as $M_ui,
  log as $M_log,
} from "./utils";

import twResources from "./locale/tw";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { PAGE, SERVER, AJV } from "./config";

//  webpack打包後的js，會自動插入< script defer>，而defer的調用會發生在DOM parse後、DOMContentLoaded前，
//  為了確保此js能應用到頁面上可能存在以CDN獲取到的其他JS庫，故將所有內容放入window.load
window.addEventListener("load", init);
async function init() {
  try {
    /* ------------------------------------------------------------------------------------------ */
    /* Const ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    const SERVER_BLOG = SERVER.BLOG;
    const PAGE_BLOG_EDIT = PAGE.BLOG_EDIT;

    const $$ajv = new $C_ajv(G.utils.axios);
    G.utils.validate = {
      blog: $$ajv.get_validate(AJV.TYPE.BLOG),
    };
    await G.main(initMain);

    async function initMain() {
      /* ------------------------------------------------------------------------------------------ */
      /* JQ Ele in Closure -------------------------------------------------------------------- */
      /* ------------------------------------------------------------------------------------------ */
      let $blog_status = $(`#${PAGE_BLOG_EDIT.ID.STATUS}`);
      let $inp_title = $(`#${PAGE_BLOG_EDIT.ID.TITLE}`);
      let $btn_updateTitle = $(`#${PAGE_BLOG_EDIT.ID.UPDATE_TITLE}`);
      let $btn_updateBlog = $(`#${PAGE_BLOG_EDIT.ID.UPDATE_BLOG}`);
      let $btn_removeBlog = $(`#${PAGE_BLOG_EDIT.ID.REMOVE_BLOG}`);
      let $span_content_count = $(
        `#${PAGE_BLOG_EDIT.ID.BLOG_HTML_STRING_COUNT}`
      );
      /* ------------------------------------------------------------------------------------------ */
      /* Public Var in Closure -------------------------------------------------------------------- */
      /* ------------------------------------------------------------------------------------------ */
      //  let { blog } = G.data

      class $C_genPayload extends Map {
        setKVpairs(dataObj) {
          //  將kv資料存入
          const entries = Object.entries(dataObj);
          if (entries.length) {
            for (let [key, value] of entries) {
              this.#set(key, value);
            }
          }
        }
        getPayload() {
          let res = {};
          for (let [key, value] of [...this]) {
            res[key] = value;
          }
          console.log(res);
          return res;
        }
        check_submit() {
          let disabled = true;
          if (this.size) {
            disabled = $span_content_count.hasClass("text-danger");
          }
          $btn_updateBlog.prop("disabled", disabled);
        }
        //  刪除數據
        del(key) {
          this.delete(key);
          if (key === "title") {
            //  若刪除的是title，關閉更新鈕
            $btn_updateTitle.prop("disabled", true);
          }
          console.log(this.getPayload());
        }
        #set(key, value) {
          if (key === "title") {
            //  若設定的是title，開啟更新鈕
            $btn_updateTitle.prop("disabled", false);
          }
          this.set(key, value);
        }
      }
      let $$payload = new $C_genPayload();
      G.utils.payload = $$payload;
      //  初始化 頁面各功能
      G.utils.editor = create_editor();
      G.utils.loading_backdrop.insertEditors([G.utils.editor]);
      await initImgData();
      G.utils.editor.focus();
      //  游標移至尾端
      G.utils.editor.move(SERVER.BLOG.EDITOR.HTML_MAX_LENGTH);
      let { debounce: handle_debounce_input } = new $C_Debounce(handle_input, {
        //  debounce階段時，限制更新鈕
        loading: () => $btn_updateTitle.prop("disabled", true),
      });

      //  $title handleInput => 驗證標題合法性
      $inp_title.on("input", handle_debounce_input);
      //  $title handleBlur => 若標題非法，恢復原標題
      $inp_title.on("blur", handle_blur);
      //  $btn_updateTitlebtn handleClick => 送出新標題
      $btn_updateTitle.on("click", handle_updateTitle);
      //  $show handleChange => 改變文章的公開狀態
      $blog_status.on("change", handle_pubOrPri);
      //  $save handleClick => 更新文章
      $btn_updateBlog.on("click", handle_updateBlog);
      //  btn#remove 綁定 click handle => 刪除 blog
      $btn_removeBlog.on("click", handle_removeBlog);

      /* ------------------------------------------------------------------------------------------ */
      /* Init ------------------------------------------------------------------------------------ */
      /* ------------------------------------------------------------------------------------------ */

      function create_editor() {
        const KEY = "html";
        let cache_content = "";
        let first = true;
        //  editor 的 繁中設定
        i18nAddResources("tw", twResources);
        i18nChangeLanguage("tw");
        const { debounce: handle_debounce_change } = new $C_Debounce(
          handle_change,
          {
            loading: () => {
              if (!first) {
                $btn_updateBlog.prop("disabled", true);
                $span_content_count
                  .text("確認中...")
                  .removeClass("text-danger");
              }
            },
          }
        );
        //  editor config
        const editorConfig = {
          hoverbarKeys: {
            image: {
              menuKeys: [
                "editImage",
                "imageWidth30",
                "imageWidth50",
                "imageWidth100",
                "deleteImage",
              ],
            },
          },
          readOnly: true,
          placeholder: "請開始撰寫文章內容...",
          //  每次editor焦點/內容變動時調用
          onChange: handle_debounce_change,
          MENU_CONF: {
            //  關於 upload img 的配置
            uploadImage: {
              //  圖片的上傳函數
              customUpload,
            },
            //  關於 edit img 的配置
            editImage: {
              //  編輯前的檢查函數
              checkImage,
            },
            insertVideo: {
              onInsertedVideo(videoNode) {
                if (videoNode == null) return;
                const { src } = videoNode;
              },
              parseVideoSrc: customParseVideoSrc,
            },
          },
        };
        //  editor 編輯欄 創建
        const editor = createEditor({
          //  插入後端取得的 html
          html: G.data.blog.html || "",
          selector: `#${PAGE_BLOG_EDIT.ID.EDITOR_CONTAINER}`,
          config: editorConfig,
        });
        //  editor 工具欄 創建
        createToolbar({
          editor,
          selector: `#${PAGE_BLOG_EDIT.ID.EDITOR_TOOLBAR_CONTAINER}`,
        });
        const handle_modalShow = gen_handle_modalShow();
        //  handle 用來隱藏 image modal 的 src & url 編輯功能
        editor.on("modalOrPanelShow", handle_modalShow);
        $span_content_count.text(
          `還能輸入${
            SERVER_BLOG.EDITOR.HTML_MAX_LENGTH - editor.getHtml().length
          }個字`
        );
        //  初始化 payload.html
        return editor;
        // 自定义转换视频
        function customParseVideoSrc(src) {
          const reg = /^https:\/\/youtu.be\/(?<hash>.{11})/;
          const res = reg.exec(src);
          if (!res) {
            return;
          }
          const template = `
                    <iframe 
                        src="https://www.youtube.com/embed/${res.groups.hash}"
                        width="570" height="370"
                        title="YouTube video player"
                        frameborder="0"
                        allow="
                            accelerometer;
                            autoplay;
                            clipboard-write;
                            encrypted-media;
                            gyroscope;
                            picture-in-picture;
                            web-share"
                        allowfullscreen
                    ></iframe>
                    `;
          return template;
        }

        //  handle 用來隱藏 image modal 的 src & url 編輯功能
        function gen_handle_modalShow() {
          let turnoff = true;
          return function (modalOrPanel) {
            if (!turnoff) {
              return;
            }
            turnoff = true;
            //  關閉handle
            const $modal = $(modalOrPanel.$elem).first();
            const $containerList = $modal.find("div > label.babel-container");
            const isImgModel =
              $containerList.first().children("span").text() ===
              twResources.image.src;
            //  若匹配，代表是 Image modal
            if (!isImgModel) {
              return;
            }
            $containerList.eq(0).hide();
            //  隱藏image modal修改src選項
            $containerList.eq(2).hide();
            //  隱藏image modal修改href選項
            return;
          };
        }
        //  editor 的 修改圖片資訊前的檢查函數
        async function checkImage(src, new_alt, url) {
          if (url || src) {
            //  RV會自動被化作警告
            return "不能修改src與url";
          }
          let res = PAGE_BLOG_EDIT.REG.IMG_ALT_ID.exec(src);
          //  取得要修改的alt_id
          let alt_id = (res.groups.alt_id *= 1);
          let blog_id = G.data.blog.id;
          let alt = $M_xss.trim(new_alt);
          await G.utils.axios.patch(PAGE_BLOG_EDIT.API.UPDATE_ALBUM, {
            alt_id,
            blog_id,
            alt,
          });
          //  尋找相同 alt_id
          let imgData = G.data.blog.map_imgs.get(alt_id);
          imgData.alt = alt;
          return true;
        }
        //  editor的 自定義上傳圖片方法
        async function customUpload(img, insertFn) {
          let nameAndExt = _getNameAndExt(img.name);
          if (!nameAndExt) {
            return false;
          }
          let { name, ext } = nameAndExt;
          //  生成 img 的 hash(hex格式)
          //  取得 img 的 MD5 Hash(hex格式)
          let hash = await _getMD5Hash(img);
          // let blogImg_id = await _findExistBlogImgId(hash);
          let blogImg = await _findExistBlogImgId(hash);
          //  blogImg = { blogImg_id, url, hash, img_id}
          let api = `${PAGE_BLOG_EDIT.API.CREATE_IMG}?hash=${hash}&blog_id=${G.data.blog.id}`;
          let formdata = new FormData();
          if (!blogImg) {
            ////  img為新圖，傳給後端新建一個blogImgAlt
            //  imgName要作為query參數傳送，必須先作百分比編碼
            name = encodeURIComponent(name);
            api += `&name=${name}&ext=${ext}`;

            formdata.append("blogImg", img);
            // res = await G.utils.axios.post(api, formdata);
          } else {
            // ////  img為重覆的舊圖，傳給後端新建一個blogImgAlt
            // res = await G.utils.axios.post(PAGE_BLOG_EDIT.API.CREATE_IMG_ALT, {
            //   blogImg_id,
            // });
            api += `&blogImg_id=${blogImg}`;
          }

          let res = await G.utils.axios.post(api, formdata);

          let { data: newImg } = res;
          //  上傳成功
          //  newImg格式:
          /*{
                        "alt_id": 16,
                        "alt": "IMG_6362",
                        "blogImg_id": 8,
                        "name": "IMG_6362",
                        "img_id": 7,
                        "url": xxxxx
                    }
                    */
          //  回傳的圖片名要做百分比解碼
          newImg.name = decodeURIComponent(newImg.name);
          //  同步數據
          G.data.blog.map_imgs.set(newImg.alt_id, newImg);
          //  將圖片插入 editor
          insertFn(`${newImg.url}?alt_id=${newImg.alt_id}`, newImg.name);
          return;
          //  取得圖片的 hash
          async function _findExistBlogImgId(hash) {
            // let blogImg_id = undefined;
            let res;
            let { map_imgs } = G.data.blog;
            if (map_imgs.size) {
              ////  確認此時要上傳的img是否為舊圖
              //  map_imgs: { MAP [
              //    <alt_id>: { alt, alt_id, blogImg_id, hash, img_id, name, url},
              //  ...] }
              let imgs = [...map_imgs.values()];
              //  img { alt_id, alt, blogImg_id, name, img_id, hash, url }
              let target = imgs.find((img) => img.hash === hash);
              if (target) {
                // blogImg_id = target.blogImg_id;
                let { alt_id, alt, blogImg_id, name, img_id, hash, url } =
                  target;
                res = { blogImg_id, url, hash, img_id };
              }
            }
            // return blogImg_id;
            return res;
          }

          //  計算 file 的 MD5 Hash
          function _getMD5Hash(file) {
            return new Promise((resolve, reject) => {
              let fr = new FileReader();
              fr.readAsArrayBuffer(file);
              fr.addEventListener("load", () => {
                if (fr.readyState === FileReader.DONE) {
                  let hash = SparkMD5.ArrayBuffer.hash(fr.result);
                  resolve(hash);
                  return;
                }
              });
              fr.addEventListener("error", () => {
                reject(fr.error);
                return;
              });
            });
          }
          function _getNameAndExt(imgName) {
            let result = true;
            let [_, name, ext] =
              PAGE_BLOG_EDIT.REG.IMG_NAME_AND_EXT.exec(imgName);
            if (!name || !ext) {
              result = false;
            }
            name = name.trim().toUpperCase();
            ext = ext.trim().toUpperCase();
            if (ext !== "PNG" && ext !== "JPG") {
              result = false;
            }
            if (result) {
              result = { name, ext };
            } else {
              alert("圖片格式錯誤，必須是png或jpg圖檔");
            }
            return result;
          }
        }

        //  handle：editor選區改變、內容改變時觸發
        async function handle_change() {
          if (first) {
            ////  迴避editor創建後，首次因為editor.focus觸發的changeEvent
            first = false;
            return;
          }
          let content = G.utils.editor.getHtml();
          cache_content = $M_xss.remove_editor_empty(content);
          let newData = { [KEY]: cache_content };
          //  校證html
          let result = await validate(newData);
          let invalid = result.some(({ valid }) => !valid);
          let { keyword, message } = result.find(
            ({ field_name }) => field_name === KEY
          );
          let text_count =
            SERVER_BLOG.EDITOR.HTML_MAX_LENGTH - cache_content.length;
          let text = `還能輸入${text_count}個字`;
          if (!invalid) {
            G.utils.payload.setKVpairs(newData);
            $span_content_count.removeClass("text-danger").text(text);
          } else {
            $$payload.del(KEY);
            let set = new Set(keyword);
            if (set.size > 2) {
              throw new Error(JSON.stringify(result));
            }
            if (set.has("_notEmpty")) {
              text = "文章內容不可為空";
              $span_content_count.addClass("text-danger").text(text);
            } else {
              $span_content_count.removeClass("text-danger").text(text);
            }
          }
          console.log("由editor change 帶動的 check");
          G.utils.payload.check_submit();
        }
      }

      /* ------------------------------------------------------------------------------------------ */
      /* Handle ------------------------------------------------------------------------------------ */
      /* ------------------------------------------------------------------------------------------ */
      //  關於 刪除文章的相關操作
      async function handle_removeBlog(e) {
        if (!confirm("真的要刪掉?")) {
          return;
        }
        const data = {
          blogList: [G.data.blog.id],
          owner_id: G.data.blog.author.id,
        };
        await G.utils.axios.delete(PAGE_BLOG_EDIT.API.UPDATE_BLOG, { data });
        alert("已成功刪除此篇文章");
        location.href = "/self";
      }
      //  關於 更新文章的相關操作
      async function handle_updateBlog(e) {
        let payload = $$payload.getPayload();
        if ($$payload.has("html")) {
          payload.html = parseImgToXImg(payload.html);
          //  將<img>轉換為自定義<x-img>
        }
        //  整理出「預計刪除BLOG→IMG關聯」的數據
        let cancelImgs = getBlogImgIdList_needToRemoveAssociate();
        if (cancelImgs.length) {
          //  若cancel有值
          payload.cancelImgs = cancelImgs; //  放入payload
        }
        let result = await validate(payload);
        let invalid = result.some(({ valid }) => !valid);
        if (invalid) {
          throw new Error(JSON.stringify(result));
        }
        payload.blog_id = G.data.blog.id;
        await G.utils.axios.patch(PAGE_BLOG_EDIT.API.UPDATE_BLOG, payload);
        for (let [key, value] of $$payload.entries()) {
          G.data.blog[key] = value;
          //  同步數據
        }
        $$payload.clear();
        //  清空$$payload
        $btn_updateBlog.prop("disabled", true);
        //  此時文章更新鈕無法點擊
        if (confirm("儲存成功！是否預覽？（新開視窗）")) {
          window.open(
            `/blog/${G.data.blog.id}?${SERVER_BLOG.SEARCH_PARAMS.PREVIEW}=true`
          );
        }
        return;

        //  將<img>替換為自定義<x-img>
        function parseImgToXImg(html) {
          let reg = PAGE_BLOG_EDIT.REG.IMG_PARSE_TO_X_IMG;
          let res;
          let _html = html;
          while ((res = reg.exec(html))) {
            let { alt_id, style } = res.groups;
            _html = _html.replace(
              res[0],
              //  此次匹配到的整條字符串
              `<x-img data-alt-id='${alt_id}' data-style='${style}'/>`
            );
          }
          return _html;
        }
      }
      //  關於 設定文章公開/隱藏時的操作
      async function handle_pubOrPri(e) {
        let KEY = "show";
        let newData = { [KEY]: e.target.checked };
        let result = await validate(newData);
        let invalid = result.some(({ valid }) => !valid);
        if (!invalid) {
          $$payload.setKVpairs(newData);
        } else {
          G.utils.payload.del(KEY);
        }
        G.utils.payload.check_submit();
        return;
      }
      //  關於 更新title 的相關操作
      async function handle_updateTitle(e) {
        e.preventDefault();
        const KEY = "title";
        const payload = {
          blog_id: G.data.blog.id,
          title: G.utils.payload.get(KEY),
        };
        let response = await G.utils.axios.patch(
          PAGE_BLOG_EDIT.API.UPDATE_BLOG,
          payload
        );
        //  同步數據
        G.data.blog[KEY] = response.data[KEY];
        G.utils.payload.del(KEY);
        G.utils.payload.check_submit();
        $M_ui.form_feedback.clear($inp_title.get(0));
        //  清空提醒
        alert("標題更新完成");
        return;
      }
      //  關於 title 輸入新值後，又沒立即更新的相關操作
      async function handle_blur(e) {
        const KEY = "title";
        const target = e.target;
        if (!G.utils.payload.has(KEY)) {
          target.value = G.data.blog.title;
          $M_ui.form_feedback.clear(target);
        }
        G.utils.payload.check_submit();
        return;
      }
      //  關於 title 輸入新值時的相關操作
      async function handle_input(e) {
        const KEY = "title";
        const target = e.target;
        let title = $M_xss.trim(target.value);
        let newData = { [KEY]: title };
        let result = await validate(newData);
        let invalid = result.some(({ valid }) => !valid);
        let result_title = result.find(
          ({ field_name }) => field_name === "title"
        );
        $M_ui.form_feedback.validated(
          target,
          result_title.valid,
          result_title.message
        );
        if (!invalid) {
          G.utils.payload.setKVpairs(newData);
        } else {
          G.utils.payload.del(KEY);
        }
        G.utils.payload.check_submit();
        return;
      }

      /* UTILS ------------------- */
      async function initImgData() {
        ////  取出存在pageData.imgs的圖數據，但editor沒有的
        ////  通常是因為先前editor有做updateImg，但沒有存文章，導致後端有數據，但editor的html沒有
        //  整理要與該blog切斷關聯的圖片，格式為[{blogImg_id, blogImgAlt_list}, ...]
        let cancelImgs = getBlogImgIdList_needToRemoveAssociate();

        if (!cancelImgs.length) {
          return;
        }
        const res = await G.utils.axios.patch(PAGE_BLOG_EDIT.API.UPDATE_BLOG, {
          cancelImgs,
          blog_id: G.data.blog.id,
          owner_id: G.data.blog.author.id,
        });
        $M_log.dev("initImgData 已將 imgs 刪除 => ", cancelImgs);
        //  整理img數據
        cancelImgs.forEach(({ blogImgAlt_list }) => {
          blogImgAlt_list.forEach((alt_id) => {
            G.data.blog.map_imgs.delete(alt_id);
          });
        });
      }
      /*  取出要移除的 blogImgAlt_id  */
      ////  移除上一次編輯時，有上傳的圖片卻沒有儲存文章，導致這次編輯時，
      ////  G.data.blog.map_imgs 內可能存在 G.data.blog.html 所沒有的圖片
      function getBlogImgIdList_needToRemoveAssociate() {
        let map_imgs_needRemove = new Map(G.data.blog.map_imgs);
        let reg = PAGE_BLOG_EDIT.REG.IMG_ALT_ID;
        //  找出editor內的<img>數據，格式為 [{src, alt, href}, ...]
        let imgs = G.utils.editor.getElemsByType("image");
        ////  從 map_imgs_needRemove 過濾掉 editor 擁有的 img
        for (let { src } of imgs) {
          let res = reg.exec(src);
          if (!res || !res.groups.alt_id) {
            continue;
          }
          map_imgs_needRemove.delete(res.groups.alt_id * 1);
        }
        ////  整理出要給後端移除照片的資訊
        let cancelImgs = Array.from(map_imgs_needRemove).reduce(
          (acc, [alt_id, { blogImg_id }]) => {
            const index = acc.findIndex((img) => img.blogImg_id === blogImg_id);
            if (index < 0) {
              ////  代表須被移除的圖檔，目前僅有一張
              acc.push({
                blogImg_id,
                blogImgAlt_list: [alt_id],
              });
            } else {
              ////  這張需被移除的圖片，目前已有一張以上的同檔
              acc[index]["blogImgAlt_list"].push(alt_id);
            }
            return acc;
          },
          []
        );
        if (!cancelImgs.length) {
          $M_log.dev("initImgData 沒有要刪除的 imgs");
        }
        return cancelImgs;
      }
      //  校驗blog數據，且決定submit可否點擊
      async function validate(newData) {
        let result = await G.utils.validate.blog({
          ...newData,
          _old: G.data.blog,
        });
        result = result.filter(({ field_name }) => field_name !== "_old");
        // let disable = result.some(({ valid }) => !valid);
        // $btn_updateBlog.prop("disabled", disable);
        return result;
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
