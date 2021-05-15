---
title: TypeScript 与 ESlint 配合使用
date: 2021-04-30
author: cj0x39e
---

为了更好的兼容 ESLint 的生态，TSLint 已放弃独立发展，时到今日 TypeScript 的类型检查工具没得选了，就是 ESLint。

## 普通 TS 项目

详细说明见 [官方文档](https://github.com/typescript-eslint/typescript-eslint/blob/HEAD/docs/getting-started/linting/README.md)，以下为不详细说明。

安装两个依赖包：

```
npm i --save-dev typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

在 ESLint 中添加如下配置：

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser", // 不配置 ESLint 根本不知道 TypeScript 是什么
  plugins: [
    "@typescript-eslint", // 加载 @typescript-eslint/eslint-plugin 插件
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", // 配置 TypeScript 推荐语法规则
  ],
};
```

这样就配好了，但是这样的配置不支持检查类型，什么意思？比如

```typ
let a: number = 1;
a = "1";
```

很明显，这不对，但是以上配置的 ESLint 不会抛出错误。由于涉及开启类型检查可能导致性能问题，所以没有作为默认行为，如何让它检查呢？这里是 [官方文档 ](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md) 。

添加如下配置：

```diff
 module.exports = {
   root: true,
   parser: '@typescript-eslint/parser',
+  parserOptions: {
+    tsconfigRootDir: __dirname,
+    project: ['./tsconfig.json'],
+  },
   plugins: ['@typescript-eslint'],
   extends: [
     'eslint:recommended',
     'plugin:@typescript-eslint/recommended',
+    'plugin:@typescript-eslint/recommended-requiring-type-checking',
   ],
 };
```

配置项作用去看官方文档吧。

## Vue + TS 项目

由于 Vue 的 `.vue` 文件的特殊性，需要使用 [vue-eslint-parser](https://github.com/vuejs/vue-eslint-parser) 。

安装:

```
npm install --save-dev eslint vue-eslint-parser
```

配置，其它可配置项参考 [官方文档](https://github.com/vuejs/vue-eslint-parser)：

```diff
module.exports = {
   root: true,
-  parser: '@typescript-eslint/parser',
+  parser: "vue-eslint-parser",
   parserOptions: {
+ 	parser: "@typescript-eslint/parser",
   	tsconfigRootDir: __dirname,
   	project: ['./tsconfig.json'],
  },
   plugins: ['@typescript-eslint'],
   extends: [
     'eslint:recommended',
     'plugin:@typescript-eslint/recommended',
     'plugin:@typescript-eslint/recommended-requiring-type-checking',
   ],
 };

```

至于 Vue 的验证规则， 到 https://eslint.vuejs.org/ 选择适合对应版本的规则即可。

如果项目大 Typescript 的类型检查可能会比较慢，开发过程中可以去掉类型检查，借助编辑器的插件进行提示。代码提交前借助 Husky 类似工具做一次验证。

或者对于 Webpack 的项目，可以使用 [fork-ts-checker-webpack-plugin](https://github.com/TypeStrong/fork-ts-checker-webpack-plugin) 插件。
