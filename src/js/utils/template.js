import lodash from "lodash";
import comment_tree from "../../views/pages/blog/template/tree.ejs";
import comment_item from "../../views/pages/blog/template/item.ejs";

import relationship_item from "../../views/pages/user/template/relationship_item.ejs";
//  使用 template-ejs-loader 將 偶像粉絲列表的項目ejs檔 轉譯為 純字符
import blog_list from "../../views/pages/user/template/blog_list.ejs";
//  使用 template-ejs-loader 將 文章列表的項目ejs檔 轉譯為 純字符

const comment = {
  tree: lodash.template(comment_tree),
  item: lodash.template(comment_item),
};

export default {
  comment,
  relationship_item: lodash.template(relationship_item),
  blog_list: lodash.template(blog_list),
};
