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
  Debounce as $C_Debounce,
  common as $M_Common,
  _ajv as $C_ajv,
  _xss as $M_xss,
  ui as $M_ui,
} from "./utils";

/* ------------------------------------------------------------------------------------------ */
/* Const --------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------ */
import { AJV, PAGE, FORM_FEEDBACK } from "./config";

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
      //  生成BS5 Modal
      let bs5_modal = new bootstrap.Modal(`#${ALBUM.ID.MODAL}`);
      const blog_id = G.data.album.blog.id;
      const el_modal = $(`#${ALBUM.ID.MODAL}`).get(0);
      const jq_modal = $(`#${ALBUM.ID.MODAL}`).eq(0);
      const jq_input_alt = jq_modal.find("input").eq(0);
      const el_input_alt = jq_input_alt.get(0);
      const jq_submit = jq_modal
        .find(".modal-footer > button:last-child")
        .eq(0);

      let { debounce: handle_debounce_input } = new $C_Debounce(handle_input);
      async function _validate_alt() {
        const KEY = "alt";
        const alt = $M_xss.trim(jq_input_alt.val());
        const alt_id = jq_modal.data(ALBUM.DATASET.KEY.ALT_ID) * 1;
        const payload = { alt_id, alt, blog_id };

        let result = await G.utils.validate.img_alt({
          _old: G.data.album.map_imgs.get(payload.alt_id),
          ...payload,
        });
        result = result.filter(({ field_name }) => field_name !== "_old");

        let invalid = result.some(({ valid }) => !valid);
        let { keyword, message } = result.find(
          ({ field_name }) => field_name === KEY
        );

        if (!invalid) {
          lock.open(payload);
          return;
        }
        if (keyword.length !== 1) {
          throw new Error(JSON.stringify(result));
        } else if (keyword[0] === "_notRepeat") {
          lock.reset();
        } else {
          lock.closet(message);
        }
      }
      let lock = {
        payload: undefined,
        validate: _validate_alt,
        open(payload) {
          this.payload = payload;
          $M_ui.form_feedback(
            FORM_FEEDBACK.STATUS.VALIDATED,
            el_input_alt,
            true
          );
          jq_submit.prop("disabled", false);
        },
        closet(message) {
          this.payload = undefined;
          $M_ui.form_feedback(
            FORM_FEEDBACK.STATUS.VALIDATED,
            el_input_alt,
            false,
            message
          );
          jq_submit.prop("disabled", true);
        },
        reset() {
          this.payload = undefined;
          $M_ui.form_feedback(FORM_FEEDBACK.STATUS.CLEAR, el_input_alt);
          jq_submit.prop("disabled", true);
        },
      };

      $(".card button").on("click", handle_cueModale);
      //  modal 顯示前的 handle
      el_modal.addEventListener("show.bs.modal", handle_showModal);
      //  modal 顯示時的 handle
      el_modal.addEventListener("shown.bs.modal", handle_shownModal);
      el_modal.addEventListener("input", handle_debounce_input);
      /* 點擊更新鈕的handle */
      jq_submit.on("click", handle_updateImgAlt);

      //  handle 更新 imgAlt
      async function handle_updateImgAlt() {
        await G.utils.axios.patch("/api/album", lock.payload);
        /* 同步頁面數據 */
        let { alt_id, alt } = lock.payload;
        G.data.album.map_imgs.get(alt_id).alt = alt;
        const jq_card = $(
          `.card[data-${ALBUM.DATASET.KEY.ALT_ID}=${alt_id}]`
        ).eq(0);
        jq_card.find(".card-text").text(alt);
        jq_card.find("img").attr("alt", alt);
        ////  重置 modal
        jq_input_alt.val();
        jq_modal.data(ALBUM.DATASET.KEY.ALT_ID, "");
        lock.reset();
        bs5_modal.hide();
      }
      async function handle_input() {
        await lock.validate();
      }
      /* modal 顯示時的 handle */
      function handle_shownModal(e) {
        //  自動聚焦在input
        el_input_alt.focus();
      }
      /* modal 顯示前的 handle */
      function handle_showModal(e) {
        //  由 bs5_modal.show(relatedTarget) 傳遞而來
        let jq_card = e.relatedTarget;
        let alt_id = jq_card.data(ALBUM.DATASET.KEY.ALT_ID) * 1;
        //  取得 modal 物件上標記的值(注意，kv是標記在obj上，而非DOM)
        let alt_id_modal = jq_modal.data(ALBUM.DATASET.KEY.ALT_ID) * 1;
        if (alt_id_modal === alt_id) {
          return;
        }
        jq_modal.data(ALBUM.DATASET.KEY.ALT_ID, alt_id);
        //  取得img數據
        const { alt } = G.data.album.map_imgs.get(alt_id);
        //  使 modal 的 input 呈現當前照片名稱
        jq_input_alt.val(alt);
      }
      //  顯示 modal 的 handle
      function handle_cueModale(e) {
        //  顯示 modal，並將 此照片容器(.card) 作為 e.relatedTarget 傳給 modal show.bs.modal 的 handle
        bs5_modal.show($(e.target).parents(".card"));
        //  show BS5 Modal，並將$card作為e.relatedTarget傳給modal
      }
    }
  } catch (e) {
    $M_Common.error_handle(e);
  }
}
