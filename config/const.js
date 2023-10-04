module.exports = {
  USER: {
    API: {
      //  api
      FOLLOW: "/api/user/follow",
      CANCEL_FOLLOW: "/api/user/cancelFollow",
      CREATE_BLOG: "/api/blog",
      REMOVE_BLOGS: "/api/blog",
      GET_BLOG_LIST: "/api/blog/list",
      //  view
      EDIT_BLOG: "/blog/edit",
    },
    CLASS: {
      PAGE_NUM_LINK: ".pagination .pagination .page-link",
    },
    ID: {
      NEW_BLOG_TITLE: "new_blog_title",
      NEW_BLOG: "new_blog",
      FANS_LIST: "fansList",
      IDOL_LIST: "idolList",
      FOLLOW: "follow",
      CANCEL_FOLLOW: "cancelFollow",
    },
    DATASET: {
      KEY: {
        BLOG_STATUS: "status",
        PAGE_TURN: "turn",
        PAGE_NUM: "page",
        PAGINATION_NUM: "pagination",
        REMOVE_BLOG: "remove-blog",
        BLOG_ID: "blog-id",
        FANS_ID: "fans-id",
      },
      VALUE: {
        NEXT_PAGE: "next-page",
        PREVIOUS_PAGE: "previous-page",
        NEXT_PAGINATION: "next-pagination",
        PREVIOUS_PAGINATION: "previous-pagination",
        REMOVE_BLOG_ITEM: "item",
        REMOVE_BLOG_LIST: "list",
      },
    },
  },
};
