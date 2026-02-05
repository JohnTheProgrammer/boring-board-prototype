import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CircularProgress,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getPosts, getTags } from "../util/api";
import { PostCard } from "../components/PostCard";
import { TagCard } from "../components/TagCard";
import { UnstyledLink } from "../components/UnstyledLink";

const postsLimit = 10;
export const SearchPosts = () => {
  const [offset, setOffset] = React.useState(0);
  const query = useQuery({
    queryKey: ["getPosts", postsLimit, offset],
    queryFn: () => getPosts({ offset: offset * postsLimit, limit: postsLimit }),
  });

  return (
    <>
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
        <Stack gap={2} paddingBottom={4}>
          {/* {query.data.posts.map((post) => ( */}
          {/*   <PostCard key={post.id} post={post} /> */}
          {/* ))} */}
          <Box display="flex" justifyContent="center">
            <Pagination
              page={offset + 1}
              color="secondary"
              // count={Math.ceil(query.data.total / postsLimit)}
              size="large"
              onChange={(_, number) => setOffset(number - 1)}
            />
          </Box>
        </Stack>
      )}
    </>
  );
};

const tagsLimit = 9;
export const SearchTags = () => {
  const [offset, setOffset] = React.useState(0);
  const query = useQuery({
    queryKey: ["getTags", tagsLimit, offset],
    queryFn: () => getTags({ offset: offset * tagsLimit, limit: tagsLimit }),
  });

  return (
    <>
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
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr 1fr"
            gap={2}
            paddingBottom={4}
          >
            {/* {query.data.tags.map((tag, index) => ( */}
            {/*   <TagCard key={tag.tag + index} tag={tag} /> */}
            {/* ))} */}
          </Box>
          <Box display="flex" justifyContent="center">
            <Pagination
              page={offset + 1}
              color="secondary"
              // count={Math.ceil(query.data.total / tagsLimit)}
              size="large"
              onChange={(_, number) => setOffset(number - 1)}
            />
          </Box>
        </>
      )}
    </>
  );
};

export const SearchProfiles = () => {
  const profilesArray = Array.from(Array(10).keys());

  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns="1fr 1fr 1fr"
        gap={2}
        paddingBottom={4}
      >
        {profilesArray.map(() => (
          <Card>
            <UnstyledLink to={"~#"}>
              <CardContent>
                <Typography variant="h6">Username</Typography>
                <Typography>Followers 100</Typography>
                <Typography>Posts 50</Typography>
                <Typography>Votes 1000</Typography>
              </CardContent>
            </UnstyledLink>
          </Card>
        ))}
      </Box>
      <Box display="flex" justifyContent="center">
        <Pagination
          page={1}
          color="secondary"
          count={10}
          size="large"
          onChange={() => {}}
        />
      </Box>
    </>
  );
};

export const Search = () => {
  const [location, navigate] = useLocation();

  return (
    <>
      <Typography variant="h1" gutterBottom>
        Search
      </Typography>
      <TextField label="Search Posts" fullWidth sx={{ marginBottom: 2 }} />
      <ButtonGroup fullWidth sx={{ paddingBottom: 2 }}>
        <Button
          variant={location === "/posts" ? "contained" : "outlined"}
          onClick={() => navigate("/posts")}
        >
          Posts
        </Button>
        <Button
          variant={location === "/tags" ? "contained" : "outlined"}
          onClick={() => navigate("/tags")}
        >
          Tags
        </Button>
        <Button
          variant={location === "/profiles" ? "contained" : "outlined"}
          onClick={() => navigate("/profiles")}
        >
          Profiles
        </Button>
      </ButtonGroup>
      <Switch>
        <Route path="/posts">
          <SearchPosts />
        </Route>
        <Route path="/tags">
          <SearchTags />
        </Route>
        <Route path="/profiles">
          <SearchProfiles />
        </Route>
        <Route>
          <Redirect to="/posts" />
        </Route>
      </Switch>
    </>
  );
};
