import $M_template from "../../template";

const option = { enumerable: false };

let id_list = {
  idolFans: [],
  articleReader: [],
  msgReceiver: [],
  clear() {
    for (let prop in this) {
      this[prop] = [];
    }
  },
  update(list) {
    for (let { type, id } of list) {
      let prop =
        type === 1 ? "idolFans" : type === 2 ? "articleReader" : "msgReceiver";
      this[prop].push(id);
    }
  },
};
Object.defineProperties(id_list, {
  clear: option,
  update: option,
});

//  操作 $$news.htmlStr 的方法
let htmlStr = {
  confirm: "",
  unconfirm: "",
  num: {
    confirm: 0,
    unconfirm: 0,
    get total() {
      return this.confirm + this.unconfirm;
    },
  },
  //  清空(更新num.htmlStr)
  clear() {
    for (let isConfirm in this) {
      this[isConfirm] = "";
      this.num[isConfirm] = 0;
    }
  },
  //  渲染(更新 num.htmlStr、num.dropdown)
  render(isConfirm) {
    if (!this.num[isConfirm]) {
      return;
    }
    let htmlStr = this[isConfirm];
    //  通知列表title
    let $title = $(`#${isConfirm}-news-title`);
    //  通知列表item的hr
    let hr = $(`[data-my-hr=${isConfirm}-news-hr]`);
    if ($title.is(":hidden")) {
      ////  處理htmlStr[isConfirm]初次渲染
      $title.show();
      $title.after(htmlStr);
    } else {
      ////  處理htmlStr[isConfirm]非初次渲染
      hr.last().parent().after(htmlStr);
    }
    this[isConfirm] = "";

    //  更新 dropdown item num
    $$news.num.dropdown[isConfirm] += this.num[isConfirm];
    //  更新 htmlStr num
    this.num[isConfirm] = 0;
  },
  //  更新htmlStr、num.htmlStr
  update(newsList, isConfirm) {
    ////  若news有數據，進行更新
    let str = this._template(newsList[isConfirm]);
    this[isConfirm] += str;
    this.num[isConfirm] += newsList[isConfirm].length;
  },
  //  生成 htmlStr
  _template(list) {
    return list.reduce((htmlStr, item) => {
      // let { confirm, id, fans, timestamp } = item;
      let { type, confirm } = item;
      if (type === 1) {
        // let { confirm, id, fans, timestamp } = item;
        htmlStr += $M_template.news_item.fansIdol(item);
      } else if (type === 2) {
        //  let { confirm, id, blog, timestamp } = item
        htmlStr += $M_template.news_item.articleReader(item);
      } else {
        //  let { confirm, id, comment, timestamp } = item
        htmlStr += $M_template.news_item.msgReceiver(item);
      }
      let hr = confirm
        ? `<li data-my-hr="confirm-news-hr">`
        : `<li data-my-hr="unconfirm-news-hr">`;
      hr += `<hr class="dropdown-divider"></li>`;
      return (htmlStr += hr);
    }, "");
  },
};
Object.defineProperties(htmlStr, {
  num: option,
  clear: option,
  render: option,
  update: option,
  _template: option,
});

function newsUpdate(data, insert) {
  let { newsList, num, hasNews } = data;
  if (hasNews) {
    this.newsClear();
  }
  for (let isConfirm in newsList) {
    //  更新 $news.newsList
    this.id_list.update(newsList[isConfirm]);
    //  更新htmlStr
    this.htmlStr.update(newsList, isConfirm);
    if (insert) {
      //  insert htmlStr
      this.htmlStr.render(isConfirm);
    }
  }
  this.num.db = num;
}

function newsClear() {
  this.htmlStr.clear();
  this.id_list.clear();
  _newsDropdownClear();

  function _newsDropdownClear() {
    $(`li[id$=-news-title]`).hide();
    //  清空頁面已渲染的通知條目
    $(".news-item").remove();
    //  清空新聞列表
    $("[data-my-hr]").remove();
    //  清空新聞列表分隔線
    this.num.dropdown.confirm = 0;
    this.num.dropdown.unconfirm = 0;
  }
}

let $$news = {
  num: {
    db: {
      confirm: 0,
      unconfirm: 0,
      total: 0,
    },
    dropdown: {
      confirm: 0,
      unconfirm: 0,
      get total() {
        return this.confirm + this.unconfirm;
      },
    },
  },
  //  存在前端的數據
  id_list,
  //  readyRender待渲染的html
  htmlStr,
  update: newsUpdate,
  clear: newsClear,
};

export default $$news;
