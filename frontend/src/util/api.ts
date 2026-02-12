import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../../backend/src/";
import { QueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";

const linkConfig = {
  url: "http://localhost:3000",
  fetch(url: URL | RequestInfo, options: RequestInit | undefined) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink(linkConfig),
      false: httpBatchLink(linkConfig),
    }),
  ],
});

export const queryClient = new QueryClient();

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export type RouterOutput = inferRouterOutputs<AppRouter>;

// DELETE EVERYTHING BELOW HERE
const sleep = async () =>
  await new Promise((resolve) => setTimeout(resolve, 500));

export const getPosts = async ({}) => {
  await sleep();
  return {};
};

export const getChatLogs = async () => {
  await sleep();
  return {};
};

export const getTags = async ({}) => {
  await sleep();
  return {};
};
