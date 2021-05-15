---
title: vue-router history模式下的微信分享小结
date: 2021-04-28
author: PengZhiQi 
---

参考链接：
[vue-router history模式下的微信分享小结](https://m.yisu.com/zixun/178203.html)
[NativeShare](https://github.com/fa-ge/NativeShare)

项目场景：
[共享住宅 wap端 详情页的分享](https://m.xzhuzhai.com/land/houseland/detail-10001.html)



**问题：微信浏览器、iOS端、在 vue-router history模式下，遇到的问题。打开页面时分享没有问题，路由一次之后再分享签名错误（invalid signature）**

原因：微信客户端不支持pushState的H5新特性

把第一次打开的页面叫做进入页；把前端路由若干次跳转（通过pushState/replaceState改变url）之后，当前打开的页面叫做当前页。

微信验签使用的url（当前网页的URL，不包含#及其后面部分），在Android下取的是当前页url，在IOS下取的是进入页的url（支付目录也是一样）

知道了这个，可以采取下面的办法来解决：

- 使用hash模式
- 做成多页应用，每个页面都是进入页
- 所有需要自定义分享的页面使用 `<a>` 替换 `<router-link>`，跟2类似，使所有自定义分享页面变成进入页

对于我们的业务场景来说，hash模式不能保证历史链接的可用性，多页/ `<a>` 跳转都是以牺牲一定体验性为代价。

经过多番尝试，最后发现用下面的方法勉强解决了问题：

**我的解决方法**

使用vuex保存进入页的URL，每次wx.config需要的参数，都使用进入页的URL来进行签名

至此，微信分享签名错误的问题解决了，但分享还是不正常

进入页面，控制自定义分享前，把当前页URL替换成进入页的URL（保证自定义分享正常）

具体代码如下：

```javascript
// middleware/share.js
export default async function({ store, app, route, req, redirect }) {
  if (process.server) {
    store.commit('user/SET_ENTRY_APP_HREF', "https://" + req.headers.host + req.originalUrl)
  }
}
```

```javascript
// 获取微信浏览器中分享的配置参数
async getShareWxData() {
  // 1.使用进入页的URL来进行签名，解决签名问题
  const url = isIOS()
    ? this.$store.state.user.entryAppHref
    : window.location.href
  const [error, res] = await this.$xFetch(getWXJSSDK({ url }))
  if (!error && res) {
    this.shareWxData = res.datas
  }
}

// 2.使用进入页的URL来覆盖本地地址，解决分享的自定义参数生效
const href = isIOS()
    ? this.$store.state.user.entryAppHref
    : window.location.href;
window.history.replaceState('', '', href)
this.nativeShare = this.$nativeShare()
if (isWeiXin()) {
  await this.getShareWxData()
  this.nativeShare.setConfig({
    wechatConfig: {
      appId: this.shareWxData.appId,
      timestamp: this.shareWxData.timestamp,
      nonceStr: this.shareWxData.nonceStr,
      signature: this.shareWxData.signature
    }
  })
}
// 获取分享文案
await this.getShareData()
this.nativeShare.setShareData({
  icon: this.shareData.img,
  link: this.shareData.link,
  title: this.shareData.title,
  desc: this.shareData.desc,
  from: ''
})
```
















