const path = require("path");

module.exports = {
  title: "新时空前端 / 博客",
  dest: path.resolve(__dirname, "../../dist"),
  themeConfig: {
    author: "nst-fe",
  },
  head: [
    [
      "script",
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-1PWBM2M60V",
        async: true,
      },
    ],
    [
      "script",
      {},
      `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-1PWBM2M60V');
      `,
    ],
  ],
  plugins: [
    [
      "vuepress-plugin-zooming",
      {
        selector: ".theme-container img",
        delay: 1000,
        options: {
          bgColor: "black",
          zIndex: 10000,
        },
      },
    ],
    require("./md5-link"),
  ],
};
