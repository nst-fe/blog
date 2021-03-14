const path = require("path");

module.exports = {
  title: "新时空前端 / 博客",
  base: "/blog/",
  theme: "simple",
  dest: path.resolve(__dirname, "../../dist"),
  themeConfig: {
    author: "nst-fe"
  },
  plugins: ["permalink-pinyin"]
};
