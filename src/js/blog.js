/* ------------------------------------------------------------------------------------------ */
/* EJS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  import("../views/pages/blog/index.ejs");
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "@css/blog.css";
import "@wangeditor/editor/dist/css/style.css";

/* ------------------------------------------------------------------------------------------ */
/* NPM Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { createEditor } from "@wangeditor/editor";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import {
  G,
  common as $M_Common,
  template as $M_template,
  redir as $M_redir,
  log as $M_log,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { PAGE } from "./config";

window.addEventListener("load", init);
async function init() {
  try {
    /* ------------------------------------------------------------------------------------------ */
    /* Const ------------------------------------------------------------------------------------ */
    /* ------------------------------------------------------------------------------------------ */
    const PAGE_BLOG = PAGE.BLOG;
    const PAGE_BLOG_EDIT = PAGE.BLOG_EDIT;

    await G.main(initMain);
    //  若是因為comment通知前來此頁面，可以直接滑動至錨點
    if (location.hash) {
      location.href = location.hash;
    }
    async function initMain() {
      function _parseHtmlStr_XImgToImg() {
        /* 將 <x-img> 數據轉回 <img> */
        let htmlStr = G.data.blog.html;
        //  複製一份htmlStr
        let reg = PAGE_BLOG_EDIT.REG.X_IMG_PARSE_TO_IMG;
        let res;
        //  存放 reg 匹配後 的 img src 數據
        while ((res = reg.exec(htmlStr))) {
          let { alt_id, style } = res.groups;
          //  MAP: alt_id → { alt, blogImg: {id, name}, img: {id, hash, url}}
          let {
            alt,
            img: { url },
          } = G.data.blog.map_imgs.get(alt_id * 1);
          let imgEle = `<img src="${url}?alt_id=${alt_id}" alt="${alt}"`;
          let replaceStr = style
            ? `${imgEle} style="${style}"/>`
            : `${imgEle}/>`;
          //  修改 _html 內對應的 img相關字符
          htmlStr = htmlStr.replace(res[0], replaceStr);
          $M_log.dev(`html內blogImgAlt/${alt_id}的tag數據-----parse完成`);
        }
        return htmlStr;
      }
      // $(`.${PAGE_BLOG.CLASS.BLOG_CONTENT}`).html(G.data.blog.html);
      $(`.${PAGE_BLOG.CLASS.BLOG_CONTENT}`).html(_parseHtmlStr_XImgToImg());
      if (!G.data.blog.showComment) {
        $M_log.dev("不需要渲染評論");
        return;
      }
      /* ------------------------------------------------------------------------------------------ */
      /* JQ Ele in Closure -------------------------------------------------------------------- */
      /* ------------------------------------------------------------------------------------------ */
      const $root_comment_list_container = $(
        `.${PAGE_BLOG.CLASS.COMMENT_LIST_CONTAINER}`
      ).first();
      const $root_editor_container = $(
        `.${PAGE_BLOG.CLASS.COMMENT_EDITOR_CONTAINER}`
      ).first();
      /* ------------------------------------------------------------------------------------------ */
      /* Public Var in Closure -------------------------------------------------------------------- */
      /* ------------------------------------------------------------------------------------------ */
      //  let { me, blog } = G.data

      //  初始化根評論editor
      init_editor($root_editor_container.get(0));
      $root_comment_list_container.on("click", handle_click);

      function handle_click(e) {
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
      }

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
          author_id: G.data.blog.author.id,
          commenter_id: G.data.me.id,
          blog_id: G.data.blog.id,
          comment_id: $remove_comment_id,
          pid: $pid,
        };
        let { data } = await G.utils.axios.delete(
          PAGE_BLOG.API.REMOVE_COMMENT,
          {
            data: payload,
          }
        );
        //  data { commenter, time, isDeleted, ... }
        let htmlStr = $M_template.comment.item({ ...data, isLogin: true });
        $btn_remove
          .parents(`.${PAGE_BLOG.CLASS.COMMENT_ITEM_CONTENT}`)
          .first()
          .html(htmlStr);
        //  同步G.data
        G.data.blog.map_comment.delete($remove_comment_id);
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
        G.utils.loading_backdrop.insertEditors([editor]);
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
          container.addEventListener("click", () =>
            $M_redir.check_login(G.data)
          );
          container.addEventListener("keydown", cancelNewLine);
          //  為container綁定送出留言的handle
          container.addEventListener("keyup", sendComment);
          //  為container綁定送出留言的handle

          function cancelNewLine(e) {
            $M_redir.check_login(G.data);
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
            $M_redir.check_login(G.data);
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
            //  送出請求
            let { data } = await postComment();
            //  渲染此次送出的評論
            renderComment(data);
            //  更新評論數據    { id, html, time, pid, commenter: { id, email, nickname}}
            G.data.blog.map_comment.mset(data);
            //  清空評論框
            editor.clear();

            return true;
            //  渲染評論 ---------------------------------------------------------------
            //  要修改
            //  ------------------------------------------------------------------------
            function renderComment(new_comment) {
              //  new_comment { item ↓ }
              //  commenter { email, id, nickname}
              //  commenter_id,
              //  html,
              //  id,
              //  isDeleted,
              //  pid,
              //  reply [],
              //  time,
              //  updatedAt
              let template_values = {
                tree: [{ ...new_comment }],
                isLogin: true,
                me_id: G.data.me.id, // commenter_id
                ejs_template: $M_template,
              };
              let html_str = $M_template.comment.tree(template_values);
              //  創建評論htmlStr，data: { id, html, time, pid, commenter: { id, email, nickname}}
              //  渲染
              editor.render(html_str);
            }
            //  送出創建評論的請求
            async function postComment() {
              let article_id = G.data.blog.id;
              let commenter_id = G.data.me.id;

              let payload = {
                article_id,
                commenter_id, //  留言者
                author_id: G.data.blog.author.id, //  文章作者
                html,
                pid: $$comment_pid,
              };
              return await G.utils.axios.post(
                PAGE_BLOG.API.CREATE_COMMENT,
                payload
              );
            }
          }
        }
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
