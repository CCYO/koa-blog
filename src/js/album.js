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
    const ALBUM = PAGE.ALBUM;
    const $$ajv = new $C_ajv(G.utils.axios);
    G.utils.validate = {
      img_alt: $$ajv.get_validate(AJV.TYPE.IMG_ALT),
    };
    await G.main(initMain);

    async function initMain() {
      let bs5_modal = new bootstrap.Modal(`#${ALBUM.ID.MODAL}`);
      //  生成BS5 Modal
      const el_modal = $(`#${ALBUM.ID.MODAL}`).get(0);
      const jq_modal = $(`#${ALBUM.ID.MODAL}`).eq(0);

      $(".card button").on("click", handle_cueModale);
      //  modal 顯示前的 handle
      el_modal.addEventListener("show.bs.modal", handle_showModal);
      //  modal 顯示時的 handle
      el_modal.addEventListener("shown.bs.modal", handle_shownModal);
      /* 點擊更新鈕的handle */
      jq_modal
        .find(".modal-footer > button:last-child")
        .on("click", handle_updateImgAlt);
      /* ---------------------------------------- Event handle ---------------------------------------- */
      //  handle 更新 imgAlt
      async function handle_updateImgAlt(e) {
        const KEY = "alt";
        const blog_id = G.data.album.blog.id;
        const alt_id = jq_modal.data(ALBUM.DATASET.KEY.ALT_ID) * 1;
        const jq_input = jq_modal.find("input").eq(0);
        const alt = $M_xss.trim(jq_input.val());
        //  當前img數據
        const payload = { alt_id, alt, blog_id };
        //  待驗證資料
        /* validate */
        let result = await _validate(payload);
        let invalid = result.some(({ valid }) => !valid);
        let { keyword, message } = result.find(
          ({ field_name }) => field_name === KEY
        );
        if (invalid && keyword.length !== 1) {
          throw new Error(JSON.stringify(result));
        }
        if (invalid) {
          alert(message);
          return;
        }
        await $$axios.patch("/api/album", payload);
        /* 同步頁面數據 */
        G.data.album.map_imgs.get(alt_id).alt = alt;
        const jq_card = $(
          `.card[data-${ALBUM.DATASET.KEY.ALT_ID}=${alt_id}]`
        ).eq(0);
        //  修改 card 的 data-my-photo標記
        jq_card.find(".card-text").text(alt);
        //  修改顯示的圖片名稱
        jq_card.find("img").attr("alt", alt);
        //  修改card圖片的alt
        /* 重置 modal */
        jq_input.val();
        //  清空input
        jq_modal.data(ALBUM.DATASET.KEY.ALT_ID, "");
        //  清空 data-my-photo 標記
        bs5_modal.hide();
        //  關閉 modal
      }
      /* modal 顯示時的 handle */
      function handle_shownModal(e) {
        //  自動聚焦在input
        jq_modal.find("input").get(0).focus();
      }
      /* modal 顯示前的 handle */
      function handle_showModal(e) {
        //  由 bs5_modal.show(relatedTarget) 傳遞而來
        let relatedTarget = e.relatedTarget;
        let alt_id = relatedTarget.data(ALBUM.DATASET.KEY.ALT_ID) * 1;
        //  取得 modal 物件上標記的值(注意，kv是標記在obj上，而非DOM)
        let alt_id_modal = jq_modal.data(ALBUM.DATASET.KEY.ALT_ID) * 1;
        if (alt_id_modal === alt_id) {
          return;
        }
        jq_modal.data(ALBUM.DATASET.KEY.ALT_ID, alt_id);
        //  取得img數據
        const { alt } = G.data.album.map_imgs.get(alt_id);
        //  使 modal 的 input 呈現當前照片名稱
        jq_modal.find("input").val(alt);
      }
      //  顯示 modal 的 handle
      function handle_cueModale(e) {
        //  顯示 modal，並將 此照片容器(.card) 作為 e.relatedTarget 傳給 modal show.bs.modal 的 handle
        bs5_modal.show($(e.target).parents(".card"));
        //  show BS5 Modal，並將$card作為e.relatedTarget傳給modal
      }
      /* ---------------------------------------- Utils ---------------------------------------- */
      /* 驗證錯誤的處理 */
      async function _validate(newData) {
        let result = await G.utils.validate.img_alt({
          _old: G.data.map_imgs.get(newData.alt_id),
          ...newData,
        });
        result = result.filter(({ field_name }) => field_name !== "_old");

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
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
