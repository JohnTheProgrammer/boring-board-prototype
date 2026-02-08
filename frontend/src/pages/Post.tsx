import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { CircularProgress, MenuItem, Select } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../util/api";
import { PostCard } from "../components/PostCard";
import type { StringRouteParams } from "wouter";
import { CommentCard } from "../components/CommentCard";
import {
  CommentCreateCard,
  type CreateCommentSchema,
} from "../components/CommentCreateCard";
import React from "react";
import { AuthenticatedContext } from "../App";

export const Post = ({
  params,
}: {
  params: StringRouteParams<"/post/:id">;
}) => {
  const isAuthenticated = React.useContext(AuthenticatedContext);
  const queryClient = useQueryClient();
  const postQuery = useQuery(
    trpc.posts.getById.queryOptions({ postId: Number(params.id) }),
  );
  const commentsQuery = useQuery(
    trpc.comments.getCommentsByPostId.queryOptions({
      postId: Number(params.id),
    }),
  );

  const createCommentMutation = useMutation(
    trpc.comments.create.mutationOptions(),
  );

  const onSubmit = (formValues: CreateCommentSchema, reset: () => void) => {
    const formData = new FormData();
    formData.set("body", formValues.body);
    formData.set("post_id", params.id);

    if (formValues.fileList.length > 0) {
      formData.set("file", formValues.fileList.item(0) as File);
    }
    createCommentMutation.mutate(formData, {
      onSuccess: (comment) => {
        queryClient.setQueryData(
          trpc.posts.getById.queryKey({ postId: Number(params.id) }),
          (post) => {
            if (!post) {
              return post;
            }
            return {
              ...post!,
              comment_amount: post!.comment_amount + 1,
            };
          },
        );

        queryClient.setQueryData(
          trpc.comments.getCommentsByPostId.queryKey({
            postId: Number(params.id),
          }),
          (comments) => {
            if (!comments) {
              return comments;
            }

            return {
              comments: [comment, ...comments.comments],
            };
          },
        );

        reset();
      },
    });
  };

  return (
    <Stack gap={2}>
      {postQuery.isPending || postQuery.isError ? (
        <Box width="100%" display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <PostCard postId={postQuery.data.id} preview={false} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Comments</Typography>
            <Select
              variant="standard"
              defaultValue="newest"
              disableUnderline
              sx={{ color: "text.secondary" }}
            >
              <MenuItem key="sortNewest" value="newest">
                Newest
              </MenuItem>
              <MenuItem key="sortTopVoted" value="topVoted">
                Top Voted
              </MenuItem>
              <MenuItem key="sortControversial" value="controversial">
                Controversial
              </MenuItem>
              <MenuItem key="sortWorstVoted" value="worstVoted">
                Worst Voted
              </MenuItem>
            </Select>
          </Box>

          <CommentCreateCard
            onSubmit={onSubmit}
            disabled={!isAuthenticated || createCommentMutation.isPending}
          />
        </>
      )}

      {commentsQuery.isPending || commentsQuery.isError ? (
        <Box width="100%" display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        commentsQuery.data.comments.map((comment) => (
          <CommentCard key={`comment-${comment.id}`} comment={comment} />
        ))
      )}
    </Stack>
  );
};
