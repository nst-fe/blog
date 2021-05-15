---
title: Vue3 watchEffect 异步问题
date: 2021-05-15
---

观察下面的代码，你猜猜会打印什么？注意，不用太关注 setTimeout 不是 EventLoop 问题。

```js
const count = ref(1);

watchEffect(() => {
  setTimeout(() => {
    console.log(count.value);
  });
});

setTimeout(() => {
  count.value = 6;
}, 1000);
```

以上代码只会打印 1，我们稍微把代码改一下，就可以让它先打印 1，过 1 秒再打印 6 [在线示例](https://codesandbox.io/s/stoic-darwin-osx65?file=/src/components/HelloWorld.vue:2341-2552)。

```diff
const count = ref(1);

watchEffect(() => {
+ const value = count.value;
  setTimeout(() => {
- 	console.log(count.value);
+   console.log(value);
  });
});

setTimeout(() => {
  count.value = 6;
}, 1000);
```

为什么会这样?我写一个超级简单的 watchEffect 来解析其原理：

```js
/**
 * 超级简单 watchEffect Demo
 */
let activeEffect = null;
// 1. 调用 activeEffect 时，将传递过来的回调存储在 activeEffect 上
const watchEffect = (effect) => {
  activeEffect = effect;
  effect();
  // 当一次调用完毕之后，将当前 activeEffect 重置为 null
  // 这样是为了确保在多次调用 watchEffect 时，activeEffect 不会因为上一次调用
  // 的值使得下一次调用收集依赖时逻辑混乱
  // ** 注意 **
  // 这里就解释了为什么 watchEffect 在使用异步取值操作之后再次赋值不触发的问题？
  // 因为在异步取值调用之前(似乎还是要有点 EventLoop 知识 ^_^),
  // activeEffect 已经置空，导致接下来的存储依赖逻辑没有依赖函数要关联,
  // 没有关联依赖就导致下次赋值时不会再次触发
  activeEffect = null;
};
const ref = (init) => {
  // 使用 proxy 在存取值时添加额外的逻辑
  const handler = {
    get: function(obj, prop) {
      // 2.
      // 初次调用 watchEffect 时，如果有取值操作且 activeEffect 有值时，
      // 我们将 activeEffect存入当前对象的  _dependEffect 依赖数组中,
      // 使它们发生关联，以便后续赋值时再次调用
      if (prop === "value") {
        if (!obj._dependEffect) {
          obj._dependEffect = [];
        }
        if (activeEffect) {
          obj._dependEffect.push(activeEffect);
        }
      }
      return obj[prop];
    },
    set: function(obj, prop, value) {
      obj[prop] = value;
      // 3. 当发生赋值操作时，遍历对象的 _dependEffect ，实现
      // 值发生变化时，再次调用  watchEffect 的效果
      if (prop === "value") {
        obj._dependEffect.forEach((effect) => {
          effect();
        });
      }
    },
  };
  return new Proxy({ value: init }, handler);
};

const count = ref(1);
watchEffect(() => {
  console.log(count.value);
});

setTimeout(() => {
  count.value = 6;
}, 1000);
```

当然，实际上的 `watchEffect` 实现没有这么简单，还有很多细节没处理，但也没有多复杂，感兴趣的可以直接阅读 effect 的源码 [https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts](https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts)，注意这不是 watchEffect 的实现，但是 watchEffect 底层是调用 reactivity 包，理解原理看这个源码就行。
