---
title: dart 入门
date: 2021-04-05
---

# 变量
## Final 和 Const
在dart中声明常量，可以使用final或const，问，他们有啥区别？

final和const的区别是，const必须赋值 常量值(编译期间需要有一个确定的值)，final可以通过计算/函数获取一个值(运行期间来确定一个值)

```dart
// const date1 = DateTime.now(); 写法错误
final date2 = DateTime.now();
```

实例变量 可以是 final 类型，但不能是 const 类型。 必须在构造函数体执行之前初始化 final 实例变量 ，在变量声明中，参数构造函数中或构造函数的初始化列表中进行初始化。

```dart
class Person {
  final String name;
  final int age;
  
  // 写法错误，必须在构造函数体执行之前初始化 final 实例变量
  // Person(this.name, {int age}){ this.age = 10; } 
  // 构造函数中初始化
  // Person(this.name, {this.age = 10}); 
  // 初始化列表中初始化
  Person(this.name, {int age}): this.age = age ?? 10; 
}
```

