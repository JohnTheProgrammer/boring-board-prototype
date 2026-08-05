import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  type StringRouteParams,
} from "wouter";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { trpc } from "../util/api";
import { MoreHoriz } from "@mui/icons-material";
import { formatDateString } from "../util/formatDateString";
import { PostCard } from "../components/PostCard";
import { CommentCard } from "../components/CommentCard";
import { ReplyCard } from "../components/ReplyCard";

const ProfileVotes = () => {
  return (
    <Stack gap={1}>
      {/* { */}
      {/*   query.data.posts.map((post: Posts) => (<PostCard key={post.id} post={post} />)) */}
      {/* } */}
      {/* <CommentCard /> */}
      {/* <CommentCard /> */}
      {/* <CommentCard /> */}
    </Stack>
  );
};

const ProfileComments = ({ username }: { username: string }) => {
  const query = useInfiniteQuery(
    trpc.comments.getManyByUsername.infiniteQueryOptions(
      { username },
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
  return (
    <Stack gap={1}>
      {query.isSuccess &&
        query.data.pages.map((page) =>
          page.map((comment) =>
            "parent_comment_id" in comment ? (
              <ReplyCard key={`reply=${comment.id}`} reply={comment} />
            ) : (
              <CommentCard
                key={`comment-${comment.id}`}
                commentId={comment.id}
              />
            ),
          ),
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
    </Stack>
  );
};

const ProfilePosts = ({ username }: { username: string }) => {
  const query = useInfiniteQuery(
    trpc.posts.getMany.byUsername.infiniteQueryOptions(
      { username },
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

  return (
    <Stack gap={1}>
      {query.isSuccess &&
        query.data.pages.map((page) =>
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
    </Stack>
  );
};

export const Profile = ({
  params,
}: {
  params: StringRouteParams<"/profile/:username">;
}) => {
  const query = useQuery(
    trpc.user.getByUsername.queryOptions({ username: params.username }),
  );
  const [location, navigate] = useLocation();
  const [openPostPopover, setOpenPostPopover] = React.useState(false);
  const postPopoverButtonRef = React.useRef(null);

  return (
    <Box>
      {query.isSuccess && (
        <>
          <Typography variant="h2">
            {query.data.user.username}
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
                <Button>Block Profile</Button>
              </Popover>
            </IconButton>
          </Typography>
          <Typography variant="h6">
            Posts {query.data.user.post_amount}
          </Typography>
          <Typography variant="h6">
            Vote Score {query.data.user.votes_total}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Date Joined: {formatDateString(query.data.user.created_at)}
          </Typography>
          <Box width="100%" display="flex" justifyContent="center">
            <ButtonGroup fullWidth sx={{ paddingBottom: 2 }}>
              <Button
                variant={location === "/posts" ? "contained" : "outlined"}
                onClick={() => navigate("/posts")}
              >
                Posts
              </Button>
              <Button
                variant={location === "/comments" ? "contained" : "outlined"}
                onClick={() => navigate("/comments")}
              >
                Comments
              </Button>
              <Button
                variant={location === "/upvotes" ? "contained" : "outlined"}
                onClick={() => navigate("/upvotes")}
              >
                Upvotes
              </Button>
              <Button
                variant={location === "/downvotes" ? "contained" : "outlined"}
                onClick={() => navigate("/downvotes")}
              >
                Downvotes
              </Button>
            </ButtonGroup>
          </Box>
          {/* This redirect causes the history to reset i.e. browser back button doesn't work. reconsider this design  */}
          <Switch>
            <Route path="/posts">
              <ProfilePosts username={params.username} />
            </Route>
            <Route path="/comments">
              <ProfileComments username={params.username} />
            </Route>
            <Route path="/replies"></Route>
            <Route path="/upvotes">
              <ProfileVotes />
            </Route>
            <Route path="/downvotes">
              <ProfileVotes />
            </Route>
            <Route>
              <Redirect to="/posts" />
            </Route>
          </Switch>
        </>
      )}
    </Box>
  );
};
