/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  require("../views/pages/blog-edit/index.ejs");
}
/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import "../css/blog-edit.css";
import "@wangeditor/editor/dist/css/style.css";

/* ------------------------------------------------------------------------------------------ */
/* NPM Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import _ from "lodash";
//  <!-- 引入 Spark-MD5 -->
import SparkMD5 from "spark-md5";
//  <!-- 引入 editor js -->
import {
  i18nAddResources,
  i18nChangeLanguage,
  createToolbar,
  createEditor,
} from "@wangeditor/editor";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
  common as $M_Common,
  _ajv as $C_ajv,
  _xss as $M_xss,
  wedgets as $M_wedgets,
  ui as $M_ui,
  Debounce as $M_Debounce,
} from "./utils";

import twResources from "../locale/tw";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { AJV, SERVER, PAGE, FORM_FEEDBACK } from "../../config/constant";

//  webpack打包後自動插入的script預設為defer，會在DOM parse後、DOMContentLoaded前
//  為了避免其他JS庫遺失，故綁定在load
window.addEventListener("load", init);

/* ------------------------------------------------------------------------------------------ */
/* Init ------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */
async function init() {
  try {
    /* ------------------------------------------------------------------------------------------ */
    /* Const ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

    const SERVER_BLOG = SERVER.BLOG;
    const PAGE_BLOG_EDIT = PAGE.BLOG_EDIT;
    const { G } = $M_wedgets;

    /* ------------------------------------------------------------------------------------------ */
    /* Class --------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */

    const $$ajv = new $C_ajv(G.utils.axios);
    G.utils.validate = {
      blog: $$ajv.get_validate(AJV.TYPE.BLOG),
    };
    await G.main(initMain);

    class $C_genPayload extends Map {
      setKVpairs(dataObj) {
        //  將kv資料存入
        const entries = Object.entries(dataObj);
        if (entries.length) {
          for (let [key, value] of entries) {
            this._set(key, value);
          }
        }
      }
      getPayload(kvPairs) {
        let res = {};
        for (let [key, value] of [...this]) {
          res[key] = value;
        }
        if (kvPairs) {
          for (let key in kvPairs) {
            res[key] = kvPairs[key];
          }
        }
        return res;
      }
      _set(key, value) {
        if (key === "title") {
          //  若刪除的是title，開啟更新鈕
          $btn_updateTitle.prop("disabled", false);
        }
        this.set(key, value);
      }
      //  刪除數據
      _del(key) {
        this.delete(key);
        if (key === "title") {
          //  若刪除的是title，關閉更新鈕
          $btn_updateTitle.prop("disabled", true);
        }
      }
    }

    /* ------------------------------------------------------------------------------------------ */
    /* Init ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */

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

      let $$payload = new $C_genPayload();

      //  初始化 頁面各功能
      G.utils.editor = init_editor();
      G.utils.loading_backdrop.insertEditors([G.utils.editor]);

      await initImgData();
      G.utils.editor.focus();
      let { debounce: handle_debounce_input } = new $M_Debounce(handle_input, {
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

      // 初始化 編輯文章頁 的功能
      function init_editor() {
        //  editor 的 繁中設定
        i18nAddResources("tw", twResources);
        i18nChangeLanguage("tw");
        const { debounce: handle_debounce_change } = new $M_Debounce(_, {
          loading: () => $btn_updateBlog.prop("disabled", true),
        });
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
                console.log("inserted video", src, videoNode);
              },
              parseVideoSrc: customParseVideoSrc,
            },
          },
        };
        // const toolbarConfig = {
        //     insertKeys: {
        //         index: 22,
        //         key: 'group-video',
        //         menuKeys: ['insertVideo', 'uploadVideo'],
        //         title: '影片'
        //     }
        // }
        //  editor 編輯欄 創建
        const editor = createEditor({
          //  插入後端取得的 html
          html: G.data.blog.html || "",
          selector: "#editor-container",
          config: editorConfig,
          // mode: 'simple'
        });
        //  editor 工具欄 創建
        const toolbar = (window.toolbar = createToolbar({
          editor,
          selector: "#toolbar-container",
          // config: toolbarConfig,
          // mode: 'simple'
        }));
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
        async function checkImage(src, alt, url) {
          if (url || src) {
            return "不能修改src與url";
          }
          //  修改
          let reg = PAGE_BLOG_EDIT.REG.IMG_ALT_ID;
          let res = reg.exec(src);
          let blog_id = G.data.blog.id;
          let alt_id = (res.groups.alt_id *= 1);
          alt = $M_xss.xssAndTrim(alt);
          await $$axios.patch(PAGE_BLOG_EDIT.API.UPDATE_ALBUM, {
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
          let { name, ext } = _getNameAndExt(img.name);
          if (ext !== "PNG" && ext !== "JPG") {
            alert("只能提供png與jpg的圖檔類型");
            return;
          }
          //  生成 img 的 hash(hex格式)
          let { exist, blogImg_id, hash } = await _getHash(img);
          let res;
          if (!exist) {
            // img為新圖，傳給後端建檔
            console.log("進行新圖處理");
            //  imgName要作為query參數傳送，必須先作百分比編碼
            name = encodeURIComponent(name);
            let api = `${PAGE_BLOG_EDIT.API.CREATE_IMG}?hash=${hash}&name=${name}&ext=${ext}&blog_id=${G.data.blog.id}`;
            let formdata = new FormData();
            //  創建 formData，作為酬載數據的容器
            formdata.append("blogImg", img);
            //  放入圖片數據
            res = await $$axios.post(api, formdata);
            //  upload
          } else {
            // img為重覆的舊圖，傳給後端新建一個blogImgAlt
            console.log("進行舊圖處理");
            res = await $$axios.post(PAGE_BLOG_EDIT.API.CREATE_IMG_ALT, {
              blogImg_id,
            });
          }
          let { data: newImg } = res;
          console.log("完成 => ", newImg);
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
          newImg.name = decodeURIComponent(newImg.name);
          //  回傳的圖片名要做百分比解碼
          G.data.blog.map_imgs.set(newImg.alt_id, newImg);
          //  同步數據
          insertFn(`${newImg.url}?alt_id=${newImg.alt_id}`, newImg.name);
          //  將圖片插入 editor
          console.log(
            "完成圖片插入囉！-------------------------------------------------"
          );
          return;
          //  取得圖片的 hash
          async function _getHash(img) {
            //  取得 img 的 MD5 Hash(hex格式)
            let hash = await _getMD5Hash(img);
            let res = {
              exist: false,
              blogImg_id: undefined,
              hash,
            };
            let { map_imgs } = G.data.blog;
            if (map_imgs.size) {
              //  利用hash，確認此時要上傳的img是否為舊圖
              let imgs = [...map_imgs.values()];
              //  img { alt_id, alt, blogImg_id, name, img_id, hash, url }
              let target = imgs.find((img) => img.hash === res.hash);
              if (target) {
                res.blogImg_id = target.blogImg_id;
                res.exist = true;
              }
            }
            return res;
            //  計算 file 的 MD5 Hash
            function _getMD5Hash(file) {
              return new Promise((resolve, reject) => {
                let fr = new FileReader();
                fr.readAsArrayBuffer(file);

                fr.addEventListener("load", (evt) => {
                  if (fr.readyState === FileReader.DONE) {
                    let hash = SparkMD5.ArrayBuffer.hash(fr.result);
                    resolve(hash);
                    return;
                  }
                });
                fr.addEventListener("error", (error) => {
                  reject(error);
                  return;
                });
              });
            }
          }

          function _getNameAndExt(imgName) {
            const reg = PAGE_BLOG_EDIT.REG.IMG_NAME_AND_EXT;
            let [_, name, ext] = reg.exec(imgName);
            return {
              name: name.trim().toUpperCase(),
              ext: ext.trim().toUpperCase(),
            };
          }
        }
        //  handle：editor選區改變、內容改變時觸發
        async function _() {
          console.log(
            "handle_change 抓到囉！-------------------------------------------------"
          );
          if (!editor) {
            //  editor尚未建構完成
            return;
          }
          const KEY = "html";
          let content = $M_xss.xssAndRemoveHTMLEmpty(editor.getHtml());
          let errors = await validate({ html: content });
          //  僅做html驗證
          $$payload.setKVpairs({ [KEY]: content });
          //  先存入payload
          const error = !errors ? null : errors[KEY];
          if (!error) {
            $span_content_count
              .text(
                `還能輸入${
                  SERVER_BLOG.EDITOR.HTML_MAX_LENGTH - content.length
                }個字`
              )
              .removeClass("text-danger");
            //  若html通過驗證，提示可輸入字數
          } else if (error["maxLength"]) {
            $span_content_count
              .text(
                `文章內容已超過${
                  content.length - SERVER_BLOG.EDITOR.HTML_MAX_LENGTH
                }個字`
              )
              .addClass("text-danger");
            //  提示html超出字數
          } else if (error["minLength"]) {
            $span_content_count
              .text(`文章內容不能為空`)
              .addClass("text-danger");
            //  提示html不可為空
          } else if (error["diff"]) {
            $$payload._del(KEY);
            //  若html與原本相同，刪去payload的html數據
          }
          await validateAll();
          //  針對整體 payload 做驗證
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
        await $$axios.delete(PAGE_BLOG_EDIT.API.UPDATE_BLOG, { data });
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
        const errors = await validateAll();
        if (errors) {
          let msg = "";
          const invalidateMsg = Object.entries(errors);
          for (let [key, obj] of invalidateMsg) {
            if (key === "all") {
              msg += obj + "\n";
              continue;
            } else if (key === "html") {
              key = "文章內容";
            } else if (key === "title") {
              key = "文章標題";
            } else if (key === "show") {
              key = "文章狀態";
            }
            msg += key + Object.values(obj).join(",") + "\n";
          }
          alert(msg);
          return;
        }
        payload.blog_id = G.data.blog.id;
        payload.owner_id = G.data.blog.author.id;
        await $$axios.patch(PAGE_BLOG_EDIT.API.UPDATE_BLOG, payload);
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
        let show = e.target.checked;
        let KEY = "show";
        let errors = await validateAll({ show });
        if (!errors || !errors[KEY]) {
          //  代表合法，存入 payload
          $$payload.setKVpairs({ [KEY]: show });
        } else if (errors[KEY]) {
          //  代表非法
          $$payload._del(KEY);
          errors[KEY].hasOwnProperty("diff") && (await validateAll());
          //  若驗證錯誤是與原值相同，則測試當前payload
        }
        return;
      }
      //  關於 更新title 的相關操作
      async function handle_updateTitle(e) {
        e.preventDefault();
        const KEY = "title";
        const payload = {
          blog_id: G.data.blog.id,
          title: $$payload.get(KEY),
        };
        let msg;
        let errors = await validate(payload);
        //  驗證
        $M_ui.form_feedback(FORM_FEEDBACK.STATUS.CLEAR, e.target);
        //  清空提醒
        if (!errors || !errors[KEY]) {
          //  代表合法
          let { data } = await $$axios.patch(
            PAGE_BLOG_EDIT.API.UPDATE_BLOG,
            payload
          );
          G.data.blog[KEY] = data[KEY];
          //  同步數據
          msg = "標題更新完成";
        } else {
          const error = errors[KEY];
          const values = Object.values(error);
          if (values.length === 1) {
            msg = "文章標題" + values[0];
          } else {
            msg = "文章標題" + values.join(",");
          }
        }
        $$payload._del(KEY);
        await validateAll();
        alert(msg);
        return;
      }
      //  關於 title 輸入新值後，又沒立即更新的相關操作
      async function handle_blur(e) {
        const KEY = "title";
        let target = e.target;
        let title = $M_xss.xssAndTrim(target.value);
        let errors = await validateAll({ [KEY]: title });
        if (!errors || !errors[KEY]) {
          return;
        }
        if (errors[KEY]) {
          target.value = G.data.blog[KEY];
          //  恢復原標題
          errors[KEY].hasOwnProperty("diff") && (await validateAll());
          //  若驗證錯誤是與原值相同，則測試當前payload
          return $M_ui.form_feedback(FORM_FEEDBACK.STATUS.CLEAR, target);
          //  移除非法提醒
        }
      }
      //  關於 title 輸入新值時的相關操作
      async function handle_input(e) {
        const KEY = "title";
        const target = e.target;
        let title = $M_xss.xssAndTrim(target.value);
        let errors = await validateAll({ [KEY]: title });
        if (!errors || !errors[KEY]) {
          $$payload.setKVpairs({ [KEY]: title });
          //  存入 payload
          return $M_ui.form_feedback(
            FORM_FEEDBACK.STATUS.VALIDATED,
            target,
            true
          );
          //  合法提醒
        }
        const error = errors[KEY];
        if (error) {
          $$payload._del(KEY);
        }
        if (error.hasOwnProperty("diff")) {
          delete error.diff;
          await validateAll();
        }
        let msg;
        const values = Object.values(error);
        if (!values.length) {
          return $M_ui.form_feedback(FORM_FEEDBACK.STATUS.CLEAR, target);
        } else if (values.length === 1) {
          msg = "文章標題" + values[0];
        } else {
          msg = "文章標題" + values.join(",");
        }
        //  若驗證錯誤是與原值相同，則測試當前payload
        return $M_ui.form_feedback(
          FORM_FEEDBACK.STATUS.VALIDATED,
          target,
          false,
          msg
        );
        //  顯示非法提醒
      }

      /* UTILS ------------------- */
      async function initImgData() {
        //  取出存在pageData.imgs的圖數據，但editor沒有的
        //  通常是因為先前editor有做updateImg，但沒有存文章，導致後端有數據，但editor的html沒有
        let cancelImgs = getBlogImgIdList_needToRemoveAssociate();
        //  整理要與該blog切斷關聯的圖片，格式為[{blogImg_id, blogImgAlt_list}, ...]
        if (!cancelImgs.length) {
          //  若cancel無值
          return;
        }
        const res = await $$axios.patch(PAGE_BLOG_EDIT.API.UPDATE_BLOG, {
          cancelImgs,
          blog_id: G.data.blog.id,
          owner_id: G.data.blog.author.id,
        });
        console.log("@@處理img res =>", res);
        //  整理img數據
        cancelImgs.forEach(({ blogImgAlt_list }) => {
          blogImgAlt_list.forEach((alt_id) => {
            G.data.blog.map_imgs.delete(alt_id);
          });
        });
      }
      /*  取出要移除的 blogImgAlt_id  */
      function getBlogImgIdList_needToRemoveAssociate() {
        let reg = PAGE_BLOG_EDIT.REG.IMG_ALT_ID;
        //  複製一份 blogImgAlt(由initEJSData取得)
        let map_imgs_needRemove = new Map(G.data.blog.map_imgs);
        //  找出editor內的<img>數據[{src, alt, href}, ...]
        for (let { src } of G.utils.editor.getElemsByType("image")) {
          /* 藉由<img>的alt_id，將仍存在editor內的圖片 從 map_imgs_needRemove 過濾掉 */
          let res = reg.exec(src);
          if (!res || !res.groups.alt_id) {
            continue;
          }
          let alt_id = res.groups.alt_id * 1;
          //  alt_id是資料庫內的既存圖片
          map_imgs_needRemove.delete(alt_id);
        }
        let cancelImgs = Array.from(map_imgs_needRemove).reduce(
          (cancelImgs, [alt_id, { blogImg_id }]) => {
            const index = cancelImgs.findIndex(
              (img) => img.blogImg_id === blogImg_id
            );
            if (index < 0) {
              //  代表還沒有與此圖檔相同的檔案，將此圖檔整筆記錄下來
              cancelImgs.push({
                blogImg_id,
                blogImgAlt_list: [alt_id],
              });
            } else {
              //  代表這張準備被移除的圖片，有一張以上的同檔
              cancelImgs[index]["blogImgAlt_list"].push(alt_id);
              //  將這張重複圖檔的alt_id，收入blogImgAlt_list
            }
            return cancelImgs;
          },
          []
        );
        if (cancelImgs.length) {
          console.log("@要刪除的img,整理結果 => ", cancelImgs);
        }
        return cancelImgs;
      }
      //  校驗blog數據，且決定submit可否點擊
      async function validate(data) {
        const errors = await $$validate_blog({
          ...data,
          $$blog: G.data.blog,
        });
        $btn_updateBlog.prop("disabled", !!errors);
        return errors;
      }
      async function validateAll(kvPairs) {
        const blogData = $$payload.getPayload(kvPairs);
        return await validate(blogData);
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
