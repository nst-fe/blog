const md5 = require("md5");

module.exports = (pluginConfig) => {
  return {
    // https://vuepress.vuejs.org/plugin/option-api.html#extendpagedata
    extendPageData($page) {
      const path = $page.path;
      $page.path = path === "/" ? path : "/" + md5(path) + ".html";
    },
  };
};
