/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  require("../views/pages/blog/index.ejs");
}
import ejs_str_commentList from "../views/pages/blog/components/comment-list.ejs";
//  使用 template-ejs-loader 將 文章列表的項目ejs檔 轉譯為 純字符

/* ------------------------------------------------------------------------------------------ */
/* CSS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "../css/blog.css";
import "@wangeditor/editor/dist/css/style.css";
// 引入 editor css

/* ------------------------------------------------------------------------------------------ */
/* NPM Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { createEditor } from "@wangeditor/editor";
// 引入 editor js
import lodash from "lodash";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
  Debounce as $M_Debounce,
  _axios as $M_axios,
  wedgets as $M_wedgets,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import CONFIG_CONST from "../../config/const";
import { COMMENT } from "../../server/model/errRes";

/* ------------------------------------------------------------------------------------------ */
/* Const ------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */

const PAGE_BLOG = CONFIG_CONST.PAGES.BLOG;
const DATA_BLOG = CONFIG_CONST.DATAS.BLOG;

/* ------------------------------------------------------------------------------------------ */
/* Class --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

const $C_initPage = new $M_wedgets.InitPage();
//  初始化頁面
const $C_backdrop = new $M_wedgets.LoadingBackdrop();
//  讀取遮罩
class $C_map_editor_list {
  map = new Map([["editorList", []]]);
  get() {
    return this.map.get("editorList");
  }
  add(editor) {
    let editorList = this.get();
    editorList.push(editor);
    this.map.set("editorList", editorList);
  }
  remove(id) {
    let editorList = this.get();
    let index = editorList.findIndex(editor => editor.id === id);
    if (index < 0) {
      return;
    }
    editorList.splice(index, 1);
    this.map.set("editorList", editorList);
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Run --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
window.addEventListener("load", async () => {
  try {
    $C_backdrop.show({ blockPage: true });
    //  讀取中，遮蔽畫面
    await $C_initPage.addOtherInitFn($M_wedgets.initEJSData);
    //  初始化ejs
    await $C_initPage.addOtherInitFn($M_wedgets.initNavbar);
    //  初始化navbar
    await $C_initPage.render(initMain);
    //  統整頁面數據，並渲染需要用到統整數據的頁面內容
    $C_backdrop.hidden();
    //  讀取完成，解除遮蔽
  } catch (error) {
    throw error;
    // location.href = `/errPage?errno=${encodeURIComponent('???')}&msg=${encodeURIComponent(error.message)}`
  }

  async function initMain({ me, blog }) {
    /* ------------------------------------------------------------------------------------------ */
    /* JQ Ele in Closure -------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */
    const $blog_content = $(`${PAGE_BLOG.ID.BLOG_CONTENT}`);
    const $comment_container = $(`#${PAGE_BLOG.ID.COMMENT_CONTAINER}`);
    /* ------------------------------------------------------------------------------------------ */
    /* Public Var in Closure -------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */
    let $$pageData = { me, blog };
    let $$map_editor_list = new $C_map_editor_list();

    //  初始化畫面

    $blog_content.html($$pageData.blog.html);
    //  渲染文章內容

    //  若文章是預覽頁，或者非公開的，不需要作評論功能設定

    let template_fn = lodash.template(ejs_str_commentList);
    window.tt = template_fn;
    if (!$$pageData.blog.showComment) {
      return;
    }
    if ($$pageData.blog.comments.length) {
      $comment_container
        .children(`.${PAGE_BLOG.CLASS.COMMENT_LIST}`)
        .html(template_fn($$pageData.blog.comments));
      // .html($$pageData.blog.commentsHtmlStr);
      delete $$pageData.blog.commentsHtmlStr;
    }

    //  初始化頁面功能
    //  公用變量

    //  移除非當前使用者留言的「刪除鈕」
    if ($$pageData.me.id) {
      $("button[data-remove]").each((index, btn) => {
        let $btn = $(btn);
        let notMyComment = $btn.data("user") * 1 !== $$pageData.me.id;
        if (notMyComment) {
          $btn.remove();
        }
      });
    }
    //  處理 因為comment通知前來此頁面，可以直接滑動至錨點
    if (location.hash) {
      location.href = location.hash;
    }

    //  初始化根評論editor
    let $root_editor = $comment_container
      .children(`[data-${PAGE_BLOG.DATASET.KEY.COMMENT_ID}=0]`)
      .children(`.${PAGE_BLOG.CLASS.COMMENT_EDITOR_CONTAINER}`)
      .first();
    init_editor($root_editor.get(0));

    $(`${PAGE_BLOG.ID.COMMENT_LIST_CONTAINER}`).on("click", e => {
      let target = e.target;
      if (target.tagName !== "BUTTON") {
        return;
      }
      e.preventDefault();
      let replyBox = target.parentElement.nextElementSibling;
      let editorContainer = replyBox.firstElementChild;
      let isExist = typeof editorContainer.show === "function";
      //  若是「刪除鈕」
      if (target.dataset.user) {
        //  再次確認
        if (!confirm("真的要刪除?")) {
          isExist && !editorContainer.isFocused() && editorContainer.show();
          return;
        }
        //  執行刪除
        removeComment(replyBox);
        return;
      }

      if (isExist) {
        //  若 editorContainer 有 show 方法，代表editor已被創建過
        //  顯示 editorContianer 即可
        editorContainer.show();
      } else {
        //  初始化editor
        init_editor(editorContainer);
      }
    });

    async function removeComment(replyBox) {
      let comment_id = replyBox.dataset.commentId * 1;
      let payload = {
        author_id: $$pageData.blog.author.id,
        commenter_id: $$pageData.me.id,
        comment_id,
        blog_id: $$pageData.blog.id,
        pid: $(replyBox)
          .parents(`.${PAGE_BLOG.CLASS.COMMENT_LIST}`)
          .first()
          .prev()
          .first()
          .data(PAGE_BLOG.DATASET.KEY.COMMENT_ID),
      };
      console.log("# => ", payload);

      let {
        data: { errno, data, msg },
      } = await $M_axios.delete(PAGE_BLOG.API.REMOVE_COMMENT, {
        data: payload,
      });
      if (errno) {
        alert(msg);
        return;
      }
      let commentBox = (replyBox.parentElement.firstElementChild.innerHTML =
        "<p>此留言已刪除</p>");
      replyBox.previousElementSibling.innerHTML = "";
      replyBox.innerHTML = "";
    }
    //  初始化editor
    function init_editor(container) {
      //  editor config

      //  功能：貼上純文字內容
      const customPaste = function (editor, event) {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        editor.insertText(text);
      };
      let editorConfig = {
        MENU_CONF: {},
        customPaste,
        autoFocus: false,
      };
      //  若container的父元素.replyBox的commentId不為0，則替editor添加onBlur handle
      if (container.parentElement.dataset.commentId * 1) {
        //  若此editor失去焦點，自動隱藏
        editorConfig.onBlur = function () {
          $(container).hide();
        };
        editorConfig.autoFocus = true;
      }
      //  editor config : placeholder
      editorConfig.placeholder = "我有話要說";
      //  editor 創建
      const editor = createEditor({
        config: editorConfig,
        selector: container,
        mode: "simple",
      });
      $C_backdrop.insertEditors([editor]);
      //  重設editor自訂的相關設定
      resetEditor();
      return editor;

      function resetEditor() {
        //  替container添加show方法
        container.show = () => {
          $(container).show();
          editor.focus();
        };
        container.blur = () => {
          editor.blur();
        };
        container.isFocused = () => {
          editor.isFocused();
        };
        //  div.replyBox
        let replyBox = (editor.replyBox = container.parentElement);
        //  editor 的 id
        let pid = (editor.id = replyBox.dataset.commentId * 1);
        //  editor 用來對 postComment 後，渲染 res 的方法
        let render = (editor.render = str => {
          if (pid) {
            $(replyBox.nextElementSibling).append(str);
          } else {
            $(
              document.querySelector(`.${PAGE_BLOG.CLASS.COMMENT_LIST}`)
            ).prepend(str);
          }
        });
        //  將editor存入editorList，以便 loadEnd 關閉 editor 的功能
        $$map_editor_list.add(editor);
        //  為container綁定判斷登入狀態的handle
        container.addEventListener("click", isLogin);
        //  為container綁定送出留言的handle
        container.addEventListener("keyup", sendComment);

        async function sendComment(e) {
          if (!isLogin()) {
            return;
          }
          //  判斷是否Enter
          let isEnter = e.key === "Enter";
          if ((e.shiftKey && isEnter) || !isEnter) {
            //  若是，且不包含Shift
            return;
          }
          let htmlStr = editor.getHtml();
          let html = htmlStr.replace(PAGE_BLOG.REG.BLOG_CONTENT_TRIM, "");
          //  撇除空留言
          if (!html.trim()) {
            editor.setHtml();
            alert("請填入留言");
            return;
          }

          // loading(map_editor_list.get())
          $C_backdrop.hidden();
          //  送出請求
          let {
            data: { errno, data, msg },
          } = await postComment();

          if (errno) {
            alert("留言失敗");
            console.log(msg);
            return;
          }
          $C_backdrop.hidden();

          //  渲染此次送出的評論
          renderComment();
          //  更新評論數據    { id, html, time, pid, commenter: { id, email, nickname}}
          updateComment(data);
          //  清空評論框
          editor.setHtml();

          //  更新評論數據，comment: { id, html, time, pid, commenter: { id, email, nickname}}
          function updateComment(comment) {
            let { id, pid, html, time } = comment;
            let commentId = $$pageData.blog.map_commentId;
            let commentPid = $$pageData.blog.map_commentPid;
            //  新建此評論為pid的commentPid
            commentPid.set(id, []);
            //  找出此評論的父評論列
            let pidList = commentPid.get(pid);
            if (!pid) {
              //    代表此評論的是隸屬根評論列
              pidList.unshift(comment); //  加入父評論列，且排在該列最前方
            } else {
              //    代表此評論隸屬子評論列
              pidList.push(comment); //  加入子評論列，且排在該列最後方
            }
            //  更新父評論列
            commentPid.set(pid, pidList);
            //  更新子評論列
            commentId.set(id, comment);
          }
          //  渲染評論 ---------------------------------------------------------------
          //  要修改
          //  ------------------------------------------------------------------------
          function renderComment() {
            let template = template_fn({
              ...data,
              reply: [],
              isDeleted: false,
            });
            //  創建評論htmlStr，data: { id, html, time, pid, commenter: { id, email, nickname}}
            // let template = templateComment(data);
            console.log("@進入渲染函數");
            //  渲染
            editor.render(template);

            //  創建評論
            function templateComment({ id, html, time, commenter }) {
              return `
                                <div class="comment-box" id="comment_${id}">
                                    <div>${html}</div>
                                    <div>
                                        By<a href="/other/${commenter.id}">${commenter.nickname}</a> 於 ${time} 發佈
                                        <button>回覆</button>
                                        <button data-remove=${id} data-user=${commenter.id}>刪除</button>
                                    </div>

                                    <div data-comment-id="${id}">
                                        <div class="editor-container"></div>
                                    </div>
                                    <div class="comment-list"></div>
                                </div>
                            `;
            }
          }
          //  送出創建評論的請求
          async function postComment() {
            let article_id = $$pageData.blog.id;
            let commenter_id = $$pageData.me.id;
            //  若 文章作者 = 留言者，payload加入author: 留言者id，否則undefined

            let payload = {
              article_id,
              commenter_id, //  留言者
              author_id: $$pageData.blog.author.id, //  文章作者
              html,
              pid: editor.id ? editor.id : null, //  editor 若為 0，代表根評論
            };
            return await $M_axios.post(PAGE_BLOG.API.CREATE_COMMENT, payload);
          }
        }
      }
    }

    /* ------------------------------------------------------------------------------------------ */
    /* Utils ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    //  確認是否登入
    function isLogin() {
      if ($$pageData.me.id) {
        //  若登入，無需動作
        return true;
      }
      if (confirm("請先登入")) {
        //  未登入，前往登入頁
        location.href = `/login?from=${location.pathname}`;
      }
      return false;
    }
  }
});
