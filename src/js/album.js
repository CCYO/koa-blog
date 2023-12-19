/* ------------------------------------------------------------------------------------------ */
/* EJS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
if (process.env.NODE_ENV === "development") {
  import("../views/pages/album/index.ejs");
}

/* ------------------------------------------------------------------------------------------ */
/* CSS Module ------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import "../css/album.css";

/* ------------------------------------------------------------------------------------------ */
/* Utils Module ----------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import {
  G,
  common as $M_Common,
  _ajv as $C_ajv,
  _xss as $M_xss,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { AJV, PAGE } from "../../config/constant";

window.addEventListener("load", init);
async function init() {
  try {
    const $$ajv = new $C_ajv(G.utils.axios);
    G.utils.validate = {
      img_alt: $$ajv.get_validate(AJV.TYPE.IMG_ALT),
    };
    await G.main(initMain);

    async function initMain() {
      await renderPage();
      /* 初始化頁面功能 */
      async function renderPage(data) {
        /* ---------------------------------------- selector ---------------------------------------- */
        // const $$selector_modal = "#modalBackdrop";
        const ALBUM = PAGE.ALBUM;

        /* ---------------------------------------- 公用變量 ---------------------------------------- */
        // let $$bs5_modal = new bootstrap.Modal($$selector_modal);
        let $$bs5_modal = new bootstrap.Modal(`#${ALBUM.ID.MODAL}`);
        //  生成BS5 Modal
        /* ---------------------------------------- JQ object ---------------------------------------- */
        const $modal = $(`#${ALBUM.ID.MODAL}`);
        /* ---------------------------------------- 綁定事件 ---------------------------------------- */
        $(".card button").on("click", handle_cueModale);
        /* modal 顯示前的 handle */
        $modal.get(0).addEventListener("show.bs.modal", handle_showModal);
        /* modal 顯示時的 handle */
        $modal.get(0).addEventListener("shown.bs.modal", handle_shownModal);
        /* 點擊更新鈕的handle */
        $modal
          .find(".modal-footer > button:last-child")
          .on("click", handle_updateImgAlt);
        /* ---------------------------------------- Event handle ---------------------------------------- */
        /* handle 更新 imgAlt */
        async function handle_updateImgAlt(e) {
          const alt_id = $modal.data("myPhoto") * 1;
          const $input = $modal.find("input");
          const alt = $M_xss.trim($input.val());
          //  img的alt
          const $$alt = G.data.album.map_imgs.get(alt_id).alt;
          //  當前img數據
          const payload = { alt_id, alt, blog_id: G.data.album.blog.id };
          //  axios的payload
          const validateData = { ...payload, $$alt };
          //  待驗證資料
          /* validate */
          let errors = await _validate(validateData);
          if (errors) {
            alert(errors);
            return;
          }
          await $$axios.patch("/api/album", payload);
          // 發出請求
          /* 同步頁面數據 */
          G.data.album.map_imgs.get(alt_id).alt = alt;
          const $card = $(`.card[data-my-photo=${alt_id}]`);
          //  修改 card 的 data-my-photo標記
          $card.find(".card-text").text(alt);
          //  修改顯示的圖片名稱
          $card.find("img").attr("alt", alt);
          //  修改card圖片的alt
          /* 重置 modal */
          $input.val();
          //  清空input
          $modal.data("myPhoto", "");
          //  清空 data-my-photo 標記
          $$bs5_modal.hide();
          //  關閉 modal
        }
        /* modal 顯示時的 handle */
        function handle_shownModal(e) {
          $modal.find("input").get(0).focus();
          //  自動聚焦在input
        }
        /* modal 顯示前的 handle */
        function handle_showModal(e) {
          //  觸發 modal show的元素
          let alt_id = e.relatedTarget.data("myPhoto") * 1;
          //  取得標記在$container上的data-my-photo
          if ($modal.data("myPhoto") * 1 === alt_id) {
            /* 若$modal已被標記data-my-photo，且等於e.relatedTarget的data-my-photo，則不需要動作 */
            return;
          }
          const { alt } = G.data.album.map_imgs.get(alt_id);
          //  取得img數據
          $modal.data("myPhoto", alt_id);
          //  使 modal 的 dataset 呈現 alt_id
          $modal.find("input").val(alt);
          //  使 modal 的 input 呈現當前照片名稱
        }
        /* 顯示 modal */
        function handle_cueModale(e) {
          $$bs5_modal.show();
          // $$bs5_modal.show($(e.target).parents(".card"));
          //  show BS5 Modal，並將$card作為e.relatedTarget傳給modal
        }
        /* ---------------------------------------- Utils ---------------------------------------- */
        /* 驗證錯誤的處理 */
        async function _validate(data) {
          const errors = await G.utils.validate.img_alt(data);
          /* 驗證錯誤的處理 */
          if (!errors) {
            return null;
          }
          return Object.entries(errors).reduce((msg, [key, kvPairs]) => {
            if (key === "alt") {
              key = "相片名稱";
            }
            let m = Object.entries(kvPairs).reduce((acc, [k, v], ind) => {
              if (ind > 0) {
                acc += ",";
              }
              return (acc += v);
            }, "");
            return (msg += `${key}${m}`);
          }, "");
        }
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
