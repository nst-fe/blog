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
  plugins: ["permalink-pinyin"],
};
