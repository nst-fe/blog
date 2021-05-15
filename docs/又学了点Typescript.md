---
title: 又学了点 TypeScript
date: 2021-03-26
author: cj0x39e
---

两年前，因为项目使用 Anguar ，以此入了 TypeScript 的坑。后来，工作的技术栈渐渐转向了 React 到现在的 Vue，这期间都用的 ES6，TS 便渐渐生疏了。最近，公司新来的同事在搭一个新的项目，因为之前聊的时候知道他用过 TS，便建议了他用 TS 来弄了。虽然 Vue3 已经可用了，但是由于 Proxy 的兼容性可能带来较大的隐患，还是选用 Vue2 + TS（下文所述都是 Vue2.x）。实际上从之前一些瞥见的资料，了解到 Vue 对 TS 不是很友好，但是 TS 在前端项目中的占有率日益增长，在公司内有必要来推进了。而且同事对此有一定的经验，项目算比较小，正是实验好时机。新项目的架子搭好后，仔细看了下，不知道是之前的 Angular + TS 搭配的太自然，还是之前我用 any 太多 😁，Vue + TS 整的像变了个框架，复杂的很。而且 TS 也多了些新的特性需要理解，借此机会分析下 Vue + TS 以及捡捡太久未摸的 TS。

Vue 本身不是使用 TS 编写的，所以使用 [Modules .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html) 的方式以支持 TS 的类型推断（见类型定义[仓库](https://github.com/vuejs/vue/tree/dev/types)）。查看 Vue 的 package.json 可以看到 typings 的配置如下：

```json
{
  "typings": "types/index.d.ts" // 使用 types 字段作用一样
}
```

此配置就是告知 TS 对 Vue 相关的类型在哪里找。但是我们不能使用如下的写法写 Vue 了：

```js
export default {
  // Vue 的选项配置
};
```

这里孤零零的一个对象字面量，TS 显然是不能知道这里是应该受 Vue 选项约束的。因此得使用如下方式：

```typescript
export default Vue.extend({});
```

因为 Vue.extend 方法，是在 vue.d.ts 中有定义，以下是截取的定义片段：

```typescript
...
extend<Data, Methods, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
...
// https://github.com/vuejs/vue/blob/529016bca92f6f098e903b1f77c70d3b0dadefaa/types/vue.d.ts#L86
```

从代码中可以看到 Vue 为了使各种配置能够实现较好的推断效果，声明写的挺复杂，其中我比较好奇的是它怎么实现的 this 推断的（特别是后期通过配置自定义的属性）？通过阅读其定义代码，发现了这样一句：

```typescript
export type ThisTypedComponentOptionsWithRecordProps<
  V extends Vue,
  Data,
  Methods,
  Computed,
  Props
> = object &
  ComponentOptions<
    V,
    DataDef<Data, Props, V>,
    Methods,
    Computed,
    RecordPropsDefinition<Props>,
    Props
  > &
  ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Props>>>;
// https://github.com/vuejs/vue/blob/529016bca92f6f098e903b1f77c70d3b0dadefaa/types/options.d.ts#L58
```

其中的 ThisType 就是实现 this 推断的关键。ThistType 的作用就是可以定义上下文的类型，要注意的是必须要开启 `--noImplicitThis` 以配合使用（更多解释说明见[官方文档](https://www.typescriptlang.org/docs/handbook/utility-types.html#thistypetype))。下面我通过一个简化的 Vue 定义简单演示：

```typescript
interface DemoVue {
  readonly $el: Element;
  $destroy(): void;
}

type DefaultData<V> = object | ((this: V) => Object);
type DefaultMethods<V> = { [key: string]: (this: V, ...args: any[]) => any };

interface ComponentOptions<
  V extends DemoVue,
  Data = DefaultData<V>,
  Methods = DefaultMethods<V>
> {
  data?: Data;
  methods?: Methods;
}

/**
 * 该联合类型的声明的后半部分 ((this: V) => Data)
 * 使得我们在使用 data () { return { xx: 'xx' } } 形式声明数据时，其返回的对象作为 Data 类型，
 * 结合 ThisType<Data> 使 this 受到 Data 的约束
 */
type DataDef<Data, V> = Data | ((this: V) => Data);

type CombinedVueInstance<Instance extends DemoVue, Data, Methods> = Data &
  Methods &
  Instance;

/**
 * 在交叉类型的最后部分 ThisType 的泛型类型值我们给定的为 CombinedVueInstance 类型，
 * 可在上方代码看到实际上其为实例对象、Data、Methods 的交叉类型，所以最终 this 受到 CombinedVueInstance 的约束
 */
type ThisComponentOptions<V extends DemoVue, Data, Methods> = object &
  ComponentOptions<V, DataDef<Data, V>, Methods> &
  ThisType<CombinedVueInstance<V, Data, Methods>>;

interface DemoVueConstructor<V extends DemoVue = DemoVue> {
  extend<Data, Methods>(options: ThisComponentOptions<V, Data, Methods>): any;
}

const DemoVue: DemoVueConstructor = {
  extend() {},
};

DemoVue.extend({
  data() {
    return {
      count: 1,
    };
  },
  methods: {
    add() {
      this.count++;
    },
  },
});
```

比如我们在 VSCode 里，把鼠标放在 this 上时，显示的 this 类型如下面的代码所示，可以看到 this 已经包含我们在 data 和 methods 中定义的属性了。

```typescript
CombinedVueInstance<DemoVue, {
    count: number;
}, {
    add(): void;
}>
```

然而在 TS + Vue 的实践中，一般不采用 Vue.extend() 的方式书写，而是使用 Class 的形式，也就是应用 [vue-class-component](https://github.com/vuejs/vue-class-component) 提供的装饰器。由于没有大量的 TS + Vue 项目经验，两种方式之间具体孰优孰劣并不清楚。但可以比较直观的感受到的就是 Vue.extend() 这种在对象字面量中配合类型定义确实结构不太清晰。

让我们来看看 vue-class-component 提供的装饰器干了些什么。下面是[官方文档](https://cn.vuejs.org/v2/guide/typescript.html#%E5%9F%BA%E4%BA%8E%E7%B1%BB%E7%9A%84-Vue-%E7%BB%84%E4%BB%B6)所提供的此方式的示例：

```typescript
import Vue from "vue";
import Component from "vue-class-component";

// @Component 修饰符注明了此类为一个 Vue 组件
@Component({
  // 所有的组件选项都可以放在这里
  template: '<button @click="onClick">Click!</button>',
})
export default class MyComponent extends Vue {
  // 初始数据可以直接声明为实例的 property
  message: string = "Hello!";

  // 组件方法也可以直接声明为实例的方法
  onClick(): void {
    window.alert(this.message);
  }
}
```

嗯，确实是比较方便和清晰的，那这个 `@Component` 装饰器到底做了什么？查看其源码，这个装饰器的最终逻辑会走到该函数：

```typescript
...
export function componentFactory (
  Component: VueClass<Vue>,
  options: ComponentOptions<Vue> = {}
): VueClass<Vue> {
      ...
      const Extended = Super.extend(options)
      ...
      return Extended
  }
...
// https://github.com/vuejs/vue-class-component/blob/16433462b40aefecc030919623f17b0ec9afe61c/src/component.ts#L24
```

其中比较关键的就是这句 `const Extended = Super.extend(options)` , 这里的 Super 要么就是 Vue 类，要么是继承了 Vue 的子类，也就是说 Super.extend 实际上就是调用的 Vue.extend()，所以并没有什么魔法，殊途同归。然后该函数主要的逻辑就是把我们在 Class 上声明的属性和方法以特定的逻辑转为 Vue.extend 配置对象的对应配置项。

另外还有一个 **[ vue-property-decorator](https://github.com/kaorun343/vue-property-decorator)** 也算是 Vue + TS 的标配了，它主要是使用 vue-class-component 提供的 [createDecorator](https://github.com/vuejs/vue-class-component/blob/16433462b40aefecc030919623f17b0ec9afe61c/src/util.ts#L20) 方法扩展了几个装饰器。比如声明 props 可以使用下面的方式，而不是使用配置项:

```typescript
@Component
export default class YourComponent extends Vue {
  @Prop(Number) readonly propA: number | undefined;
  @Prop({ default: "default value" }) readonly propB!: string;
  @Prop([String, Boolean]) readonly propC: string | boolean | undefined;
}
```

当然其最终的逻辑也是帮我们把以类成员方式书写的配置转化为 Vue.extend 配置对象的对应配置项。
