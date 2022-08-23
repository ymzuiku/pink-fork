import cluster from "node:cluster";
import { watchFile } from "node:fs";
import { cpus } from "node:os";

interface PinkFork {
  onExit?(error: Error, kind: string): any;
  onPrimary?(): any;
  onWorker?(): any;
}

export const pinkFork = async (p: PinkFork) => {
  if (cluster.isPrimary) {
    const proxyExit = (err: Error, kind: string) => {
      if (p.onExit) {
        p.onExit(err, kind);
      }
      console.log("__debug__", "save");
      // db.prepare(
      //   "insert into life (id, create_at, err, kind) values (?, ?, ?, ?)"
      // ).run(
      //   getId(), // 只存100w条数据
      //   getCreateAt(),
      //   err.message,
      //   kind
      // );
    };

    // const a = await db.prepare("select count(*) from life").get();
    // console.log("__debug__", a);

    let u = cpus().length - 1;
    if (u < 2) {
      u = 2;
    }
    for (let i = 0; i < u; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      cluster.fork();
      if (code == 3) {
        return;
      }
      proxyExit(
        new Error(
          `worker exit: ${worker.process.pid}; msg:${code}, code:${code}, signal:${signal}`
        ),
        "worker-dead"
      );
    });
    if (p.onPrimary) {
      await Promise.resolve(p.onPrimary());
    }

    watchFile(__filename, (...args) => {
      Object.keys(cluster.workers).forEach((v) => {
        const w = cluster.workers[v];
        w.send("pink-fork-reload");
      });
    });

    process.on("uncaughtException", () => {
      proxyExit(
        new Error(`master deamon is uncaughtException!!!`),
        "master-dead"
      );
    });
  } else if (cluster.isWorker) {
    console.log("fork worker:", process.pid);
    if (p.onWorker) {
      await Promise.resolve(p.onWorker());
    }
  }
};

pinkFork.safeClose = (appClose: any) => {
  if (cluster.isWorker) {
    // 防止进程提前挂掉
    process.on("uncaughtException", () => {
      Promise.resolve(appClose()).then(() => {
        process.exit(1);
      });
    });

    process.on("message", (msg) => {
      if (msg === "pink-fork-reload") {
        Promise.resolve(appClose()).then(() => {
          console.log("safe-close");
          process.exit(3);
        });
      }
    });
  }
};
