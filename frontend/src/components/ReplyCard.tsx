import React from "react";
import {
  Card,
  Divider,
  CardActions,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CardActionArea,
} from "@mui/material";
import { AuthenticatedContext } from "../App";
import { CommentContent } from "./CommentCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../util/api";
import { useLocation } from "wouter";

export const ReplyCard = ({ reply }: { reply: any }) => {
  const queryClient = useQueryClient();
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const isAuthenticated = React.useContext(AuthenticatedContext);
  const [location, navigate] = useLocation();

  const deleteReplyMutation = useMutation(
    trpc.comments.deleteById.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(
          trpc.posts.getById.queryKey({ postId: reply.post_id }),
          (post) => {
            if (!post) {
              return post;
            }

            return {
              ...post,
              replies_amount: post.replies_amount - 1,
            };
          },
        );

        queryClient.setQueryData(
          trpc.comments.getCommentsByPostId.queryKey({ postId: reply.post_id }),
          (comments) => {
            if (!comments) {
              return comments;
            }

            return {
              comments: comments.comments.map((comment) =>
                comment.id === reply.parent_comment_id
                  ? { ...comment, replies_amount: comment.replies_amount - 1 }
                  : comment,
              ),
            };
          },
        );

        queryClient.setQueryData(
          trpc.comments.getRepliesByCommentId.queryKey({
            commentId: reply.parent_comment_id,
          }),
          (replies) => {
            if (!replies) {
              return replies;
            }

            return {
              replies: replies.replies.filter(
                (replyQueryData) => replyQueryData.id !== reply.id,
              ),
            };
          },
        );

        setDeleteDialogVisible(false);
      },
    }),
  );

  return (
    <>
      <Card>
        {location === `/post/${reply.post_id}` ? (
          <CommentContent {...reply} />
        ) : (
          <CardActionArea onClick={() => navigate(`~/post/${reply.post_id}`)}>
            <CommentContent {...reply} />
          </CardActionArea>
        )}
        <Divider />
        <CardActions>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Button>Hide Reply</Button>
            {isAuthenticated && isAuthenticated.username === reply.username && (
              <Box>
                <Button
                  color="error"
                  fullWidth
                  onClick={() => setDeleteDialogVisible(true)}
                >
                  Delete Reply
                </Button>
              </Box>
            )}
          </Box>
        </CardActions>
      </Card>

      <Dialog
        open={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(!deleteDialogVisible)}
      >
        <DialogTitle>Delete Reply?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your reply?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogVisible(false)}
            disabled={deleteReplyMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            autoFocus
            disabled={deleteReplyMutation.isPending}
            onClick={() => deleteReplyMutation.mutate({ commentId: reply.id })}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
