import { initTRPC, TRPCError } from "@trpc/server";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";

export const jwtSecretKey = "secret";
const authorizationCookieName = "authorization";

export const createContext = async (opts: CreateHTTPContextOptions) => {
  let authorization: null | JwtPayload = null;
  if (opts.req.headers.cookie) {
    const authorizationCookiePair = opts.req.headers.cookie
      .split("; ")
      .find((string) => string.startsWith(`${authorizationCookieName}=`));
    let authorizationCookieValue: string = "";
    if (authorizationCookiePair) {
      authorizationCookieValue = authorizationCookiePair.split("=")[1];
    }

    if (authorizationCookiePair && authorizationCookieValue.length > 0) {
      authorization = jwt.verify(
        authorizationCookieValue,
        jwtSecretKey,
      ) as JwtPayload;
    }
  }

  return {
    authorization,
    setAuthorizationCookie(jwtToken: string) {
      opts.res.setHeader(
        "set-cookie",
        `${authorizationCookieName}=${jwtToken}; HttpOnly`,
      );
    },
    removeAuthorizationCookie() {
      opts.res.setHeader("set-cookie", `${authorizationCookieName}=; HttpOnly`);
    },
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const authenticatedProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.authorization) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      authorization: ctx.authorization,
    },
  });
});
