import React from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import {
  ArrowDownward,
  ArrowUpward,
  Comment,
  MoreHoriz,
} from "@mui/icons-material";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import { formatDateString } from "../util/formatDateString";
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { trpcClient, queryClient, trpc, type RouterOutput } from "../util/api";
import { useLocation } from "wouter";
import { AuthenticatedContext } from "../App";
import { getVoteChange } from "../util/getVoteChange";
import { UnstyledLink } from "./UnstyledLink";

const bodyPreviewProps = {
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
};

const mediaStyle = {
  width: "auto",
  height: "auto",
  maxHeight: "700px",
  maxWidth: "100%",
  marginBottom: 2,
};

export const PostCard = ({
  post,
  preview = true,
}: {
  post:
    | RouterOutput["posts"]["getMany"]["posts"][0]
    | RouterOutput["posts"]["getById"];
  preview?: boolean;
}) => {
  const isAuthenticated = React.useContext(AuthenticatedContext);
  const [location, navigate] = useLocation();
  const [openPostPopover, setOpenPostPopover] = React.useState(false);
  const postPopoverButtonRef = React.useRef(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);

  const voteMutation = useMutation({
    mutationFn: ({
      postId,
      vote,
    }: {
      postId: number;
      vote: 1 | -1;
      prevUserVote: 1 | 0 | -1;
    }) =>
      trpcClient.posts.vote.mutate({
        postId,
        vote,
      }),
    onMutate: async ({ postId, vote, prevUserVote }) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: trpc.posts.getMany.pathKey(),
        }),
        queryClient.cancelQueries({ queryKey: trpc.posts.getById.queryKey() }),
      ]);

      // todo update this to getQueries and update the change the corresponding rollback to setQueries for onError
      const getManyQueryData = queryClient.getQueryData(
        trpc.posts.getMany.queryKey(),
      );

      const getByIdQueryData = queryClient.getQueryData(
        trpc.posts.getById.queryKey({ postId }),
      );

      const { modifier, newVote } = getVoteChange(prevUserVote, vote);

      queryClient.setQueriesData(
        { queryKey: trpc.posts.getMany.pathKey() },
        (posts: RouterOutput["posts"]["getMany"]) => {
          const updatedPost = {
            ...post,
            votes: post.votes + modifier,
            user_vote: newVote,
          };

          if (!posts) {
            return posts;
          }
          return {
            posts: posts.posts.map((post) =>
              post.id === postId ? updatedPost : post,
            ),
          };
        },
      );

      queryClient.setQueryData(
        trpc.posts.getById.queryKey({ postId }),
        (post) => {
          if (!post) {
            return post;
          }
          return {
            ...post,
            votes: post.votes + modifier,
            user_vote: newVote,
          };
        },
      );

      return { getManyQueryData, getByIdQueryData };
    },
    onError: (_err, variables, context) => {
      if (context && context.getManyQueryData) {
        queryClient.setQueryData(
          trpc.posts.getMany.queryKey(),
          context.getManyQueryData,
        );
      }
      if (context && context.getByIdQueryData) {
        queryClient.setQueryData(
          trpc.posts.getById.queryKey({ postId: variables.postId }),
          context.getByIdQueryData,
        );
      }
    },
  });

  const deletePostMutation = useMutation(
    trpc.posts.deleteById.mutationOptions({
      onSuccess: (_, { postId }) => {
        queryClient.setQueriesData(
          { queryKey: trpc.posts.getMany.pathKey() },
          (posts: RouterOutput["posts"]["getMany"]) => {
            if (!posts) {
              return posts;
            }
            return {
              posts: posts.posts.filter((post) => post.id !== postId),
            };
          },
        );

        queryClient.removeQueries({
          queryKey: trpc.posts.getById.queryKey({ postId }),
        });

        setDeleteDialogVisible(false);

        if (location === `/post/${postId}`) {
          navigate("/posts");
        }
      },
    }),
  );
  const isVotingEnabled = !!isAuthenticated && !voteMutation.isPending;

  const content = (
    <CardContent>
      <Typography variant="subtitle2" color="textSecondary">
        <UnstyledLink
          href={`/profile/${post.username}`}
          onClick={(e) => e.stopPropagation()}
        >
          {post.username}
        </UnstyledLink>
        &nbsp; • &nbsp;
        {formatDateString(post.created_at)}
      </Typography>
      <Typography
        variant="h6"
        gutterBottom={!!(post.body || post.media || post.tags.length > 0)}
      >
        {post.title}
      </Typography>
      {post.body && (
        <Typography
          variant="body1"
          marginBottom={post.media || post.tags.length > 0 ? 2 : undefined}
          whiteSpace="pre-wrap"
          {...(preview && bodyPreviewProps)}
        >
          {post.body}
        </Typography>
      )}
      {post.media && (
        <CardMedia component="img" image={post.media} sx={mediaStyle} />
      )}
      {post.tags.length > 0 && (
        <Box sx={{ display: "flex", gap: 1 }}>
          {post.tags.map((tag) => (
            <Chip
              key={`post-${post.id}-tag-${tag}`}
              label={tag}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </CardContent>
  );

  return (
    <>
      {/* Don't make this an onclick. Make card action area a link*/}
      <Card>
        {location === `/post/${post.id}` ? (
          content
        ) : (
          <CardActionArea onClick={() => navigate(`~/post/${post.id}`)}>
            {content}
          </CardActionArea>
        )}
        <Divider />
        <CardActions>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Box display="flex" alignItems="center" marginRight={2}>
              <IconButton
                onClick={() =>
                  voteMutation.mutate({
                    postId: post.id,
                    vote: 1,
                    prevUserVote: post.user_vote as 0 | 1 | -1,
                  })
                }
                disabled={!isVotingEnabled}
                color={post.user_vote === 1 ? "primary" : "default"}
                size="small"
              >
                <ArrowUpward />
              </IconButton>
              <Typography variant="body2" color="textSecondary">
                {post.votes}
              </Typography>
              <IconButton
                onClick={() =>
                  voteMutation.mutate({
                    postId: post.id,
                    vote: -1,
                    prevUserVote: post.user_vote as 0 | 1 | -1,
                  })
                }
                disabled={!isVotingEnabled}
                color={post.user_vote === -1 ? "secondary" : "default"}
                size="small"
              >
                <ArrowDownward />
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" marginRight={2}>
              <IconButton size="small" color="default">
                <Comment />
              </IconButton>
              <Typography variant="body2" color="textSecondary">
                {post.comment_amount} comments + {post.replies_amount} replies
              </Typography>
            </Box>
            <Box marginLeft="auto">
              <IconButton
                ref={postPopoverButtonRef}
                onClick={() => setOpenPostPopover(!openPostPopover)}
              >
                <MoreHoriz />
                <Popover
                  open={openPostPopover}
                  anchorEl={postPopoverButtonRef.current}
                  onClose={() => setOpenPostPopover(false)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <Box>
                    <Button fullWidth>Hide Post</Button>
                  </Box>
                  {isAuthenticated &&
                    isAuthenticated.username === post.username && (
                      <Box>
                        <Button
                          color="error"
                          fullWidth
                          onClick={() => setDeleteDialogVisible(true)}
                        >
                          Delete Post
                        </Button>
                      </Box>
                    )}
                </Popover>
              </IconButton>
            </Box>
          </Box>
        </CardActions>
      </Card>

      <Dialog
        open={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(!deleteDialogVisible)}
      >
        <DialogTitle>Delete Post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{post.title}"
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogVisible(false)}
            disabled={deletePostMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            autoFocus
            disabled={deletePostMutation.isPending}
            onClick={() => deletePostMutation.mutate({ postId: post.id })}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
