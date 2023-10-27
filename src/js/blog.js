/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  require("../views/pages/blog/index.ejs");
}
import $M_template from "./utils/template";
//  包裝好的ejs template

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

/* ------------------------------------------------------------------------------------------ */
/* Utils Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import {
  Debounce as $M_Debounce,
  _axios as $C_axios,
  wedgets as $M_wedgets,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */

import CONFIG_CONST, { PAGES } from "../../config/const";
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

const $$axios = new $C_axios({ backdrop: $C_backdrop });
//  讀取遮罩

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
    const $root_comment_list_container = $(
      `.${PAGE_BLOG.CLASS.COMMENT_LIST_CONTAINER}`
    ).first();
    // const $root_editor_container = $comment_container.children(
    const $root_editor_container = $(
      `.${PAGE_BLOG.CLASS.COMMENT_EDITOR_CONTAINER}`
    ).first();
    /* ------------------------------------------------------------------------------------------ */
    /* Public Var in Closure -------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */
    let $$pageData = { me, blog };
    window.$$pageData = $$pageData;

    //  若是因為comment通知前來此頁面，可以直接滑動至錨點
    if (location.hash) {
      location.href = location.hash;
    }

    //  初始化根評論editor
    init_editor($root_editor_container.get(0));
    $root_comment_list_container.on("click", (e) => {
      let target = e.target;
      if (target.tagName !== "BUTTON") {
        return;
      }
      e.preventDefault();
      let $target = $(e.target);
      let replyBox = $target
        .parents(`.${PAGE_BLOG.CLASS.COMMENT_ITEM_CONTENT}`)
        .first();
      replyBox = replyBox.next();
      replyBox = replyBox.get(0);
      let isExist = typeof replyBox.show === "function";
      let remove_comment_id =
        $(target).data(PAGE_BLOG.DATASET.KEY.REMOVE_COMMENT) * 1;
      //  若是「刪除鈕」
      if (remove_comment_id) {
        //  再次確認
        if (!confirm("真的要刪除?")) {
          isExist && !replyBox.isFocused() && replyBox.show();
          return;
        }
        //  執行刪除
        removeComment(e.target);
        return;
      }

      if (isExist) {
        //  若 editorContainer 有 show 方法，代表editor已被創建過
        //  顯示 editorContianer 即可
        replyBox.show();
      } else {
        //  初始化editor
        init_editor(replyBox);
      }
    });

    async function removeComment(btn_remove) {
      let $btn_remove = $(btn_remove);
      let $comment_item_container = $btn_remove
        .parents(`.${PAGE_BLOG.CLASS.COMMENT_ITEM_CONTAINER}`)
        .first();
      let $remove_comment_id = $btn_remove.data(
        PAGE_BLOG.DATASET.KEY.REMOVE_COMMENT
      );
      let $pid = $comment_item_container
        .parents(`[data-${PAGE_BLOG.DATASET.KEY.PID}]`)
        .first()
        .data(PAGE_BLOG.DATASET.KEY.PID);
      let payload = {
        author_id: $$pageData.blog.author.id,
        commenter_id: $$pageData.me.id,
        blog_id: $$pageData.blog.id,
        comment_id: $remove_comment_id,
        pid: $pid,
      };
      let response = await $$axios.delete(PAGE_BLOG.API.REMOVE_COMMENT, {
        data: payload,
      });
      if (response.errno) {
        alert(response.msg);
        return;
      }
      let htmlStr = $M_template.comment.item({
        commenter: $$pageData.me,
        time: response.data.time,
        isDeleted: true,
        isLogin: true,
      });
      $btn_remove
        .parents(`.${PAGE_BLOG.CLASS.COMMENT_ITEM_CONTENT}`)
        .first()
        .html(htmlStr);
      //  同步$$pageData
      $$pageData.blog.comment.map.delete($remove_comment_id);
      return;
    }

    //  初始化editor
    function init_editor(container) {
      const $container = $(container);
      let $$comment_pid = $container.data(PAGE_BLOG.DATASET.KEY.PID);
      let $$isRootEditor = $$comment_pid === undefined;
      $$comment_pid = $$isRootEditor ? 0 : $$comment_pid;

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
      if (!$$isRootEditor) {
        //  若此editor失去焦點，自動隱藏
        editorConfig.onBlur = function () {
          $container.hide();
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
          $container.show();
          editor.focus();
        };
        container.blur = () => {
          editor.blur();
        };
        container.isFocused = () => {
          editor.isFocused();
        };
        //  div.replyBox
        let replyBox = (editor.replyBox = container);
        //  editor 的 id
        editor.pid = $$comment_pid;
        //  editor 用來對 postComment 後，渲染 res 的方法
        editor.render = (html) => {
          if ($$comment_pid) {
            $(replyBox.nextElementSibling).append(html);
          } else {
            $(`[data-${PAGE_BLOG.DATASET.KEY.PID}=0]`).prepend(html);
          }
        };
        //  為container綁定判斷登入狀態的handle
        container.addEventListener("click", isLogin);
        container.addEventListener("keydown", cancelNewLine);
        //  為container綁定送出留言的handle
        container.addEventListener("keyup", sendComment);
        //  為container綁定送出留言的handle

        function cancelNewLine(e) {
          if (!isLogin()) {
            return;
          }
          //  判斷是否Enter
          let isEnter = e.key === "Enter";
          if ((e.shiftKey && isEnter) || !isEnter) {
            //  若是，且包含Shift
            return true;
          }
          e.preventDefault();
          return false;
        }

        async function sendComment(e) {
          if (!isLogin()) {
            return;
          }
          //  判斷是否Enter
          let isEnter = e.key === "Enter";
          if ((e.shiftKey && isEnter) || !isEnter) {
            //  若是，且包含Shift
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

          //  送出請求
          let responseData = await postComment();
          $C_backdrop.hidden();
          if (responseData.errno) {
            alert("留言失敗");
            console.log(responseData.msg);
            return;
          }
          //  渲染此次送出的評論
          renderComment(responseData.data);
          //  更新評論數據    { id, html, time, pid, commenter: { id, email, nickname}}
          $$pageData.blog.comment.map.set(responseData.data);
          //  清空評論框
          editor.clear();

          return true;
          //  渲染評論 ---------------------------------------------------------------
          //  要修改
          //  ------------------------------------------------------------------------
          function renderComment(new_comment) {
            let commenter_id = $$pageData.me.id;
            let template_values = {
              tree: [
                {
                  ...new_comment,
                  reply: [],
                  isDeleted: false,
                },
              ],
              isLogin: isLogin(),
              me_id: commenter_id,
              ejs_template: $M_template,
            };
            let html_str = $M_template.comment.tree(template_values);
            //  創建評論htmlStr，data: { id, html, time, pid, commenter: { id, email, nickname}}
            //  渲染
            editor.render(html_str);
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
              pid: $$comment_pid,
            };
            return await $$axios.post(PAGE_BLOG.API.CREATE_COMMENT, payload);
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
