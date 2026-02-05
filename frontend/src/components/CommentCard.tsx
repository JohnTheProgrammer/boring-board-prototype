import React from "react";
import {
  MoreHoriz,
  ArrowDownward,
  ArrowUpward,
  ExpandMore,
  Reply,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  CardActions,
  Box,
  IconButton,
  Popover,
  Button,
  CardMedia,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CardActionArea,
} from "@mui/material";
import { trpc, trpcClient, type RouterOutput } from "../util/api";
import { formatDateString } from "../util/formatDateString";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVoteChange } from "../util/getVoteChange";
import { AuthenticatedContext } from "../App";
import {
  CommentCreateCard,
  type CreateCommentSchema,
} from "./CommentCreateCard";
import { ReplyCard } from "./ReplyCard";
import { useLocation } from "wouter";
import { UnstyledLink } from "./UnstyledLink";

const mediaStyle = {
  width: "auto",
  height: "auto",
  maxHeight: "700px",
  maxWidth: "100%",
  marginBottom: 2,
};

export const CommentContent = ({
  username,
  created_at,
  media,
  body,
}: {
  username: string;
  created_at: string;
  media?: string | null;
  body: string;
}) => {
  return (
    <CardContent>
      <Box marginBottom={1}>
        <Typography variant="subtitle2">
          <UnstyledLink
            href={`~/profile/${username}`}
            onClick={(e) => e.stopPropagation()}
          >
            {username}
          </UnstyledLink>
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {formatDateString(created_at)}
        </Typography>
      </Box>
      <Typography variant="body2" {...(media && { marginBottom: 2 })}>
        {body}
      </Typography>
      {media && <CardMedia component="img" image={media} sx={mediaStyle} />}
    </CardContent>
  );
};

export const CommentCard = ({
  comment,
}: {
  comment: RouterOutput["comments"]["getCommentsByPostId"]["comments"][0];
}) => {
  const queryClient = useQueryClient();
  const isAuthenticated = React.useContext(AuthenticatedContext);
  const [openCommentPopover, setOpenCommentPopover] = React.useState(false);
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [showReplies, setShowReplies] = React.useState(false);
  const commentPopoverButtonRef = React.useRef(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const [location, navigate] = useLocation();

  const getRepliesByCommentIdQuery = useQuery(
    trpc.comments.getRepliesByCommentId.queryOptions(
      { commentId: comment.id },
      {
        enabled: false,
      },
    ),
  );

  const voteMutation = useMutation({
    mutationFn: ({
      commentId,
      vote,
    }: {
      commentId: number;
      vote: 1 | -1;
      prevUserVote: 1 | 0 | -1;
    }) =>
      trpcClient.comments.vote.mutate({
        commentId,
        vote,
      }),
    onMutate: async ({ commentId, vote, prevUserVote }) => {
      await queryClient.cancelQueries({
        queryKey: trpc.posts.getById.queryKey(),
      });

      const { modifier, newVote } = getVoteChange(prevUserVote, vote);

      const getByIdQueryData = queryClient.getQueryData(
        trpc.posts.getById.queryKey({ postId: comment.post_id }),
      );

      queryClient.setQueryData(
        trpc.comments.getCommentsByPostId.queryKey({ postId: comment.post_id }),
        (comments) => {
          if (!comments) {
            return comments;
          }

          return {
            comments: comments.comments.map((mapComment) => {
              if (commentId === mapComment.id) {
                return {
                  ...comment,
                  votes: comment.votes + modifier,
                  user_vote: newVote,
                };
              }
              return mapComment;
            }),
          };
        },
      );

      return { getByIdQueryData };
    },

    onError: (_err, _variables, context) => {
      if (context && context.getByIdQueryData) {
        queryClient.setQueryData(
          trpc.posts.getById.queryKey({ postId: comment.post_id }),
          context.getByIdQueryData,
        );
      }
    },
  });

  const deleteCommentMutation = useMutation(
    trpc.comments.deleteById.mutationOptions({
      onSuccess: (_, { commentId }) => {
        // TODO update the post getMany and getById caches to lower the comment amount. ESPECIALLY the getById Cache
        queryClient.setQueryData(
          trpc.comments.getCommentsByPostId.queryKey({
            postId: comment.post_id,
          }),
          (comments) => {
            if (!comments) {
              return comments;
            }

            return {
              comments: comments.comments.filter(
                (filterComment) => filterComment.id !== commentId,
              ),
            };
          },
        );

        setDeleteDialogVisible(false);
      },
    }),
  );

  const createReplyMutation = useMutation(
    trpc.comments.createReply.mutationOptions(),
  );

  const isVotingEnabled = !!isAuthenticated && !voteMutation.isPending;

  const onSubmit = (formValues: CreateCommentSchema, reset: () => void) => {
    const formData = new FormData();
    formData.set("body", formValues.body);
    formData.set("comment_id", comment.id.toString());
    formData.set("post_id", comment.post_id.toString());

    if (formValues.fileList.length > 0) {
      formData.set("file", formValues.fileList.item(0) as File);
    }

    createReplyMutation.mutate(formData, {
      onSuccess: (reply) => {
        queryClient.setQueryData(
          trpc.comments.getCommentsByPostId.queryKey({
            postId: comment.post_id,
          }),
          (comments) => {
            if (!comments) {
              return comments;
            }

            return {
              comments: comments.comments.map((mapComment) =>
                comment.id === mapComment.id
                  ? {
                      ...comment,
                      replies_amount: comment.replies_amount + 1,
                    }
                  : mapComment,
              ),
            };
          },
        );

        queryClient.setQueryData(
          trpc.comments.getRepliesByCommentId.queryKey({
            commentId: comment.id,
          }),
          (replies) => {
            if (!replies) {
              return replies;
            }
            return { replies: [...replies.replies, reply] };
          },
        );

        queryClient.setQueryData(
          trpc.posts.getById.queryKey({
            postId: comment.post_id,
          }),
          (post) => {
            if (!post) {
              return post;
            }

            return {
              ...post,
              replies_amount: post.replies_amount + 1,
            };
          },
        );

        queryClient.setQueriesData(
          { queryKey: trpc.posts.getMany.pathKey() },
          (posts: RouterOutput["posts"]["getMany"]) => {
            if (!posts) {
              return posts;
            }
            return {
              posts: posts.posts.map((post) =>
                post.id === comment.post_id
                  ? { ...post, replies_amount: post.replies_amount + 1 }
                  : post,
              ),
            };
          },
        );

        reset();
      },
    });
  };

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries({
        queryKey: trpc.comments.getRepliesByCommentId.queryKey({
          commentId: comment.id,
        }),
      });
    };
  }, []);

  const repliesOnClick = () => {
    if (!getRepliesByCommentIdQuery.isFetched) {
      getRepliesByCommentIdQuery.refetch();
    }

    setShowReplies(!showReplies);
  };

  return (
    <React.Fragment key={`comment-${comment.id}`}>
      <Card>
        {location === `/post/${comment.post_id}` ? (
          <CommentContent {...comment} />
        ) : (
          <CardActionArea onClick={() => navigate(`~/post/${comment.post_id}`)}>
            <CommentContent {...comment} />
          </CardActionArea>
        )}
        <Divider />
        <CardActions>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Box display="flex" alignItems="center" marginRight={2}>
              <IconButton
                onClick={() =>
                  voteMutation.mutate({
                    commentId: comment.id,
                    vote: 1,
                    prevUserVote: comment.user_vote as 0 | 1 | -1,
                  })
                }
                disabled={!isVotingEnabled}
                color={comment.user_vote === 1 ? "primary" : "default"}
                size="small"
              >
                <ArrowUpward />
              </IconButton>
              <Typography variant="body2" color="textSecondary">
                {comment.votes}
              </Typography>
              <IconButton
                onClick={() =>
                  voteMutation.mutate({
                    commentId: comment.id,
                    vote: -1,
                    prevUserVote: comment.user_vote as 0 | 1 | -1,
                  })
                }
                disabled={!isVotingEnabled}
                color={comment.user_vote === -1 ? "secondary" : "default"}
                size="small"
              >
                <ArrowDownward />
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" marginRight={2}>
              <IconButton
                size="small"
                color="default"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply />
                <Typography variant="body2" color="textSecondary">
                  Reply
                </Typography>
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" marginRight={2}>
              <IconButton
                size="small"
                color="default"
                onClick={repliesOnClick}
                disabled={getRepliesByCommentIdQuery.isLoading}
              >
                <Typography variant="body2" color="textSecondary">
                  Replies {comment.replies_amount}
                </Typography>
                <ExpandMore />
              </IconButton>
            </Box>
            <Box marginLeft="auto">
              <IconButton
                ref={commentPopoverButtonRef}
                onClick={() => setOpenCommentPopover(!openCommentPopover)}
              >
                <MoreHoriz />
                <Popover
                  open={openCommentPopover}
                  anchorEl={commentPopoverButtonRef.current}
                  onClose={() => setOpenCommentPopover(false)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  <Button>Hide Comment</Button>
                  {isAuthenticated &&
                    isAuthenticated.username === comment.username && (
                      <Box>
                        <Button
                          color="error"
                          fullWidth
                          onClick={() => setDeleteDialogVisible(true)}
                        >
                          Delete Comment
                        </Button>
                      </Box>
                    )}
                </Popover>
              </IconButton>
            </Box>
          </Box>
        </CardActions>
      </Card>
      {(showReplyForm ||
        (showReplies &&
          getRepliesByCommentIdQuery.data &&
          getRepliesByCommentIdQuery.data.replies.length > 0)) && (
        <Stack
          gap={2}
          sx={{
            paddingLeft: 3,
            marginLeft: 1,
            borderLeft: "solid 2px lightgray",
          }}
        >
          {showReplyForm && (
            <CommentCreateCard
              onSubmit={onSubmit}
              disabled={!isAuthenticated || createReplyMutation.isPending}
            />
          )}
          {showReplies &&
            getRepliesByCommentIdQuery.data &&
            getRepliesByCommentIdQuery.data.replies.map((reply) => (
              <ReplyCard key={`reply-${reply.id}`} reply={reply} />
            ))}
        </Stack>
      )}

      <Dialog
        open={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(!deleteDialogVisible)}
      >
        <DialogTitle>Delete Comment?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your comment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogVisible(false)}
            disabled={deleteCommentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            autoFocus
            disabled={deleteCommentMutation.isPending}
            onClick={() =>
              deleteCommentMutation.mutate({ commentId: comment.id })
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
