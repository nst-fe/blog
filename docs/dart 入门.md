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

实例变量 可以是 final 类型，但不能是 const 类型。 必须在构造函数体执行之前初始化 final 实例变量 ，在变量声明中，参数构造函数中 或构造函数的初始化列表中 进行初始化。

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



# 函数

## 可选参数
先来一张图理清它们的概念关系

<img src="./assets/flutter/v2-4507b0f462f98194796c0cdb2f2e757a_720w.jpg" alt="v2-4507b0f462f98194796c0cdb2f2e757a_720w" style="zoom:50%;" />

注意：参数默认值只针对可选参数才能添加的，所以必需参数不能设置默认值。





# 类

## 构造函数

在dart中有2种构造函数比较特别，因为这不仅仅是构造函数，更是一种模式

他们分别是：常量构造函数和工厂构造函数

### 常量构造函数

```dart
class Point {
  final int x;
  final int y;
  const Point(this.x, this.y);
}
void main() {
  var a = const Point(1, 2);
  var b = const Point(1, 2);
  // 两者是同一个实例
  assert(identical(a, b)) 
}
```



### 工厂构造函数

有时候为了返回一个之前已经创建的缓存对象，原始的构造方法已经不能满足要求

那么可以使用工厂模式来定义构造函数，并且用关键字new来获取之前已经创建的缓存对象

```dart
class Logger { 
  final String name; 
  // 缓存
  static final Map<String, Logger> _cache = <String, Logger>{}; 
    
  Logger(this.name); 
    
  factory Logger(String name) { 
    if (_cache.containsKey(name)) { 
      return _cache[name]; 
    } else { 
      final logger = new Logger._internal(name); 
      _cache[name] = logger; 
      return logger; 
    } 
  }
} 
```

