import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { Pool } from "pg";
import { createContext, router } from "./trpc";
import * as Minio from "minio";
import { userRouter } from "./routers/user";
import { postsRouter } from "./routers/posts";
import { commentsRouter } from "./routers/comments";
import { tagsRouter } from "./routers/tags";
// use this to run migrations programatically maybe?
// import { runner } from "node-pg-migrate";

export const pool = new Pool({
  user: "postgres",
  password: "password",
  port: 5432,
  database: "boringboard",
});

export const publicBucket = "testbucket";
export const minioUrl = "http://localhost:9000";

export const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

const appRouter = router({
  user: userRouter,
  posts: postsRouter,
  comments: commentsRouter,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  middleware: cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  router: appRouter,
  createContext,
  onError(opts) {
    const { error, type, path } = opts;

    console.log(error, type, path);
  },
});

const port = 3000;

server.listen(port);
console.log(`Listening on port ${port}`);
