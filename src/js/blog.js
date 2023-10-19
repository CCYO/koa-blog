/* ------------------------------------------------------------------------------------------ */
/* EJS Module --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  require("../views/pages/blog/index.ejs");
}
import ejs_str_commentList from "../views/pages/blog/template/list.ejs";
import ejs_str_commentItem from "../views/pages/blog/template/item.ejs";
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
    let index = editorList.findIndex((editor) => editor.id === id);
    if (index < 0) {
      return;
    }
    editorList.splice(index, 1);
    this.map.set("editorList", editorList);
  }
}
//  用來蒐集所有的editor，以便 dackdrop 使用

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
    const $root_editor_container = $comment_container.children(
      `.${PAGE_BLOG.CLASS.COMMENT_EDITOR_CONTAINER}`
    );
    /* ------------------------------------------------------------------------------------------ */
    /* Public Var in Closure -------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------------ */
    let $$pageData = { me, blog };
    window.$$pageData = $$pageData;
    let $$map_editor_list = new $C_map_editor_list();
    let $$template_fn_comment_list = lodash.template(ejs_str_commentList);
    let $$template_fn_comment_item = lodash.template(ejs_str_commentItem);

    //  初始化畫面
    $blog_content.html($$pageData.blog.html);
    //  若是因為comment通知前來此頁面，可以直接滑動至錨點
    if (location.hash) {
      location.href = location.hash;
    }

    //  初始化根評論editor
    init_editor($root_editor_container.get(0));

    $(`#${PAGE_BLOG.ID.COMMENT_LIST_CONTAINER}`).on("click", (e) => {
      console.log(123);
      let target = e.target;
      if (target.tagName !== "BUTTON") {
        return;
      }
      e.preventDefault();
      let replyBox = target.parentElement.nextElementSibling;
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
        removeComment(target);
        // removeComment(remove_comment_id);
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

    async function removeComment(div_comment) {
      let $div_comment = $(div_comment)
        .parents(`[data-${PAGE_BLOG.DATASET.KEY.COMMENT_ID}]`)
        .first();
      let $remove_comment_id = $div_comment.data(
        PAGE_BLOG.DATASET.KEY.COMMENT_ID
      );
      let $pid = $div_comment
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
      console.log("# => ", payload);

      // let { errno, data, msg } = await $M_axios.delete(
      //   PAGE_BLOG.API.REMOVE_COMMENT,
      //   {
      //     data: payload,
      //   }
      // );
      // if (errno) {
      //   alert(msg);
      //   return;
      // }
      let htmlStr = lodash.template(ejs_str_commentItem)({
        isDeleted: true,
        isLogin: true,
        commenter: $$pageData.me,
        time: 456465,
      });
      $div_comment.get(0).innerHTML = htmlStr;
      //  同步$$pageData
      let index = $$pageData.blog.comments.findIndex(
        (item) => item.id === $remove_comment_id
      );
      $$pageData.blog.comments[index] = data;
      return;
    }

    // async function removeComment(replyBox) {
    //   let comment_id = replyBox.dataset.commentId * 1;
    //   let payload = {
    //     author_id: $$pageData.blog.author.id,
    //     commenter_id: $$pageData.me.id,
    //     comment_id,
    //     blog_id: $$pageData.blog.id,
    //     pid: $(replyBox)
    //       .parents(`.${PAGE_BLOG.CLASS.COMMENT_LIST}`)
    //       .first()
    //       .prev()
    //       .first()
    //       .data(PAGE_BLOG.DATASET.KEY.COMMENT_ID),
    //   };
    //   console.log("# => ", payload);

    //   let {
    //     data: { errno, data, msg },
    //   } = await $M_axios.delete(PAGE_BLOG.API.REMOVE_COMMENT, {
    //     data: payload,
    //   });
    //   if (errno) {
    //     alert(msg);
    //     return;
    //   }
    //   let commentBox = (replyBox.parentElement.firstElementChild.innerHTML =
    //     "<p>此留言已刪除</p>");
    //   replyBox.previousElementSibling.innerHTML = "";
    //   replyBox.innerHTML = "";
    // }
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
          // let { errno, data, msg } = await postComment();
          await postComment();
          $C_backdrop.hidden();
          // if (errno) {
          //   alert("留言失敗");
          //   console.log(msg);
          //   return;
          // }
          //  渲染此次送出的評論
          renderComment();
          //  更新評論數據    { id, html, time, pid, commenter: { id, email, nickname}}
          // updateComment(data);
          //  清空評論框
          editor.setHtml();

          
          //  渲染評論 ---------------------------------------------------------------
          //  要修改
          //  ------------------------------------------------------------------------
          function renderComment() {
            let commenter_id = $$pageData.me.id;
            let data = { id: 8989, html, time: '???', pid: $$comment_pid, commenter: { id: commenter_id, nickname: $$pageData.me.nickname }}
            let template_values = {
              comments: [{
                ...data,
                reply: [],
                isDeleted: false,
              }],
              isLogin: isLogin(),
              me_id: commenter_id,
              temFn_comment_list: $$template_fn_comment_list,
              temFn_comment_item: $$template_fn_comment_item
            };
            let html_str = $$template_fn_comment_list(template_values);
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
