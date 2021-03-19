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
    "permalink-pinyin",
    [
      "@vssue/vuepress-plugin-vssue",
      {
        // set `platform` rather than `api`
        platform: "github",

        // all other options of Vssue are allowed
        owner: "nst-fe",
        repo: "blog",
        clientId: "7a482526c12e6a8123f0",
        clientSecret: "4faf2e5ce70c1ef2328da0f6bd8306160a7b53cf",
      },
    ],
  ],
};
