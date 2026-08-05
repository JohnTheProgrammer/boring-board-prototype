import React from "react";
import Stack from "@mui/material/Stack";
import { PostCard } from "../components/PostCard";
import {
  useInfiniteQuery,
  useQueryClient,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { trpc, type RouterInput, type RouterOutput } from "../util/api";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Box from "@mui/system/Box";
import { Search } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import z from "zod";
import { useSearchParams } from "wouter";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../../backend/src";
import type { TRPCInfiniteData } from "@trpc/tanstack-react-query";

const createdAtValues = ["Anytime", "Hour", "Today", "Week", "Month", "Year"];
const orderByValues = ["Newest", "Top Voted", "Controversial", "Worst Voted"];

const getManyForm = z.object({
  search: z.string().trim(),
  createdAt: z.enum(createdAtValues),
  orderBy: z.enum(orderByValues),
});

type GetManyForm = z.infer<typeof getManyForm>;

export const Posts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, handleSubmit } = useForm<GetManyForm>();
  const query = useInfiniteQuery(
    trpc.posts.getMany.all.infiniteQueryOptions(
      {
        search: searchParams.get("search"),
        createdAt: searchParams.get("createdAt"),
        orderBy: searchParams.get("orderBy"),
      },
      {
        getNextPageParam: (lastPage) => {
          if (lastPage.length === 0) {
            return undefined;
          }
          return lastPage[lastPage.length - 1].id;
        },
      },
    ),
  );

  const onSubmit = handleSubmit(async (formValues) => {
    setSearchParams(formValues);
  });

  return (
    <Stack gap={2} paddingBottom={4}>
      <form onSubmit={onSubmit}>
        <Paper
          elevation={0}
          sx={{ display: "flex", alignItems: "center", padding: 1, gap: 2 }}
        >
          <InputBase
            placeholder="Search Posts"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            {...register("search")}
          />
          <TextField
            select
            variant="standard"
            slotProps={{
              select: {
                disableUnderline: true,
              },
              input: { ...register("createdAt") },
            }}
            sx={{ width: 125 }}
            defaultValue={createdAtValues[0]}
          >
            {createdAtValues.map((value, index) => (
              <MenuItem key={`createdAt-${value}-${index}`} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            variant="standard"
            slotProps={{
              select: {
                disableUnderline: true,
              },
              input: { ...register("orderBy") },
            }}
            defaultValue={orderByValues[0]}
            sx={{ width: 125 }}
          >
            {orderByValues.map((value, index) => (
              <MenuItem key={`orderBy-${value}-${index}`} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit">Search</Button>
        </Paper>
      </form>
      {query.isPending || query.isError ? (
        <Box
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {query.data.pages.map((page) =>
            page.map((post) => (
              <PostCard key={`post-${post.id}`} postId={post.id} />
            )),
          )}
          {query.hasNextPage && (
            <Box display="flex" justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetching}
              >
                Load More
              </Button>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};
