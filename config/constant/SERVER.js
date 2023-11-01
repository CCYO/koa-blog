const SERVER = {
  RELATIONSHIP: {
    TYPE: {
      FANSLIST: "fansList",
    },
  },
  BLOG: {
    STATUS: {
      PUBLIC: "public",
      PRIVATE: "private",
    },
    PAGINATION: {
      BLOG_COUNT: 5,
      PAGE_COUNT: 2,
    },
    EDITOR: {
      HTML_MAX_LENGTH: 65535,
      HTML_MIN_LENGTH: 1,
    },
    SEARCH_PARAMS: {
      PREVIEW: "preview",
    },
    TIME_FORMAT: "YYYY/MM/DD HH:mm:ss",
  },
};

module.exports = SERVER;
