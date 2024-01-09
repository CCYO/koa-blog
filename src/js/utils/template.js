import lodash from "lodash";
import comment_tree from "@views/pages/blog/template/tree.ejs";
import comment_item from "@views/pages/blog/template/item.ejs";

import navbar_login_uncollapse_list from "@views/wedgets/navbar_login_uncollapse_list.ejs";
import navbar_login_collapse_list from "@views/wedgets/navbar_login_collapse_list.ejs";

import news_item_fansIdol from "@views/wedgets/news_idolFans.ejs";
import news_item_articleReader from "@views/wedgets/news_articleReader.ejs";
import news_item_msgReceiver from "@views/wedgets/news_msgReceiver.ejs";

import relationship_item from "@views/pages/user/template/relationship_item.ejs";
//  使用 template-ejs-loader 將 偶像粉絲列表的項目ejs檔 轉譯為 純字符
import blog_list from "@views/pages/user/template/blog_list.ejs";
//  使用 template-ejs-loader 將 文章列表的項目ejs檔 轉譯為 純字符

const comment = {
  tree: lodash.template(comment_tree),
  item: lodash.template(comment_item),
};

const navbar = {
  uncollapse_list: lodash.template(navbar_login_uncollapse_list),
  collapse_list: lodash.template(navbar_login_collapse_list),
};

const news_item = {
  fansIdol: lodash.template(news_item_fansIdol),
  articleReader: lodash.template(news_item_articleReader),
  msgReceiver: lodash.template(news_item_msgReceiver),
};

export default {
  news_item,
  navbar,
  comment,
  relationship_item: lodash.template(relationship_item),
  blog_list: lodash.template(blog_list),
};
