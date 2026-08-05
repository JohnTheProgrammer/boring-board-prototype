import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../../backend/src/";
import {
  QueryCache,
  QueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

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

type GetManyInfinitePost = InfiniteData<
  RouterOutput["posts"]["getMany"][keyof RouterOutput["posts"]["getMany"]]
>;

type GetCommentsInfinitePost = InfiniteData<
  RouterOutput["comments"]["getManyByPostId"]
>;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (data, query) => {
      const pathArray = query.queryKey[0] as string[];
      if (pathArray.includes("posts") && pathArray.includes("getMany")) {
        (data as GetManyInfinitePost).pages.map((page) =>
          page.forEach((post) => {
            queryClient.setQueryData(
              trpc.posts.getById.queryKey({ postId: post.id }),
              post,
            );
          }),
        );
      }

      if (
        pathArray.includes("comments") &&
        pathArray.includes("getManyByPostId")
      ) {
        (data as GetCommentsInfinitePost).pages.map((page) =>
          page.forEach((comment) => {
            queryClient.setQueryData(
              trpc.comments.getById.queryKey({ commentId: comment.id }),
              comment,
            );
          }),
        );
      }

      if (
        pathArray.includes("comments") &&
        pathArray.includes("getManyByUsername")
      ) {
        (data as GetCommentsInfinitePost).pages.map((page) =>
          page.forEach((comment) => {
            queryClient.setQueryData(
              trpc.comments.getById.queryKey({ commentId: comment.id }),
              comment,
            );
          }),
        );
      }
    },
  }),
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// DELETE EVERYTHING BELOW HERE
const sleep = async () =>
  await new Promise((resolve) => setTimeout(resolve, 500));

export const getPosts = async ({}) => {
  await sleep();
  return {};
};

export const getPost = async () => {
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
