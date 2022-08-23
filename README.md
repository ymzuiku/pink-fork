# 🐤 pink-fork

利用线程池执行您的 Nodejs 程序, 并且保持多线程代码编写在原有文件中.

## 起因

现在 Nodejs 在 I/O 密集型的性能是过剩的, 而在多核 CPU 和内存利用率上是落后的

<!-- 如果仅仅启动若干个 Cluster，生产机器的多核 CPU 利用率无法上去。 -->

## 目标

- [x] 守护进程
- [x] 自动 fork
- [x] 文件部署后自动重启
- [x] 心跳检测

## 结构

```text
+--------+     +------------+
| daemon | --> | works x n  |
+--------+     +------------+
```

- deamon 是主进程, 它做的仅仅是守护 master 进程, 确保如果 master 消亡会进行重启
- worker threads 根据任务量自动伸缩的线程, 我们的 99%的代码都在此.

## 使用

首先编写 `index.js`:

```js
const { pinkFork } = require("pink-fork");
pinkFork({
  onError: (err, type) => {
    console.error(err, type);
  },
  worker: () => import("./app"),
});
```
