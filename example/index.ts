import { pinkFork } from "../lib";

pinkFork({
  onExit(error, kind) {
    console.error("__debug__", error, kind);
  },
  onPrimary: () => {
    console.log("http://127.0.0.1:6100/v1/hello");
  },
  onWorker: () => import("./app"),
});
