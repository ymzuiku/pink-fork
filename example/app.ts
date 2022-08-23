import fastify from "fastify";
import { pinkFork } from "../lib";

const app = fastify();

app.get("/v1/hello", (res, rej) => {
  rej.send({ hello: "123" });
});

let arr = [];
app.get("/v1/exit", (res, rej) => {
  process.exit(1);
});

app.listen({ port: 6100 });

pinkFork.safeClose(app.close);
