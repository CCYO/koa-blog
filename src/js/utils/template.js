import lodash from "lodash";
import comment_tree from "../../views/pages/blog/template/tree.ejs";
import comment_item from "../../views/pages/blog/template/item.ejs";

const comment = {
  tree: lodash.template(comment_tree),
  item: lodash.template(comment_item),
};

export default {
  comment,
};
