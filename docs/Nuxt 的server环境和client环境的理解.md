---
title: Nuxt 的server环境和client环境的理解
date: 2021-03-19
description: 为第一次使用Nuxt的人，填一点点坑
---



## 错误理解：asyncData 只在server端运行

当页面第一次加载或者浏览器上刷新页面时，asyncData 是在server端运行。

通过路由跳转时，asyncData 都是在client端运行。

类似Nuxt中间件，当页面第一次加载或者浏览器上刷新页面时，Nuxt中间件会在server端和client端运行，通过路由跳转时，Nuxt中间件 只在client端运行。



## 错误理解：使用a标签跳转页面

我没接触过Nuxt时的理解：既然要服务端渲染，项目就不能是spa了，因为我的理解就是每个页面都要从服务端拿，所以一定是多页应用程序。

现在的理解：Nuxt 是一个 spa 应用，也就是 Nuxt 的路由跳转都是局部刷新。

```javascript
// 不要用下面的方法，浏览器重新加载，加载变慢
// html: <a href="/shop/cart">购物车</a>
window.location.href = path

// 正确使用
// html: <nuxt-link to="/shop/cart">购物车</nuxt-link>
this.$router.push({ path })
```



### 最后更新时间 2021/3/22，会持续更新下去的

