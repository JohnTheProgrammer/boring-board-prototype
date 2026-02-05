import React from "react";
import { Route, Switch } from "wouter";
import { Box, Container, CssBaseline } from "@mui/material";
import { Chat } from "./pages/Chat";
import { CreatePost } from "./pages/CreatePost";
import { Login } from "./pages/Login";
import { Post } from "./pages/Post";
import { Posts } from "./pages/Posts";
import { Profile } from "./pages/Profile";
import { Search } from "./pages/Search";
import { Settings } from "./pages/Settings";
import { SignUp } from "./pages/Signup";
import { Tag } from "./pages/Tag";
import { Tags } from "./pages/Tags";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, trpc } from "./util/api";
import { ResponsiveNavigation } from "./components/ResponsiveNavigation";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import "./App.css";

export const AuthenticatedContext = React.createContext<
  { username: string } | false
>(false);
const theme = createTheme({ cssVariables: true });

const drawerWidth = 240;

function App() {
  const query = useQuery(
    trpc.user.isAuthenticated.queryOptions(undefined, { retry: false }),
  );
  const logoutMutation = useMutation(
    trpc.user.logout.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.user.isAuthenticated.queryKey(),
        });
      },
    }),
  );

  return (
    <AuthenticatedContext
      value={query.isSuccess ? { username: query.data.username } : false}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            height: "100%",
            minHeight: "100vh",
            width: "100%",
            backgroundColor: "#f5f5f5",
          }}
        >
          <ResponsiveNavigation
            drawerWidth={drawerWidth}
            onLogout={() => logoutMutation.mutate()}
          />
          <Box sx={{ marginLeft: { xs: 0, lg: `${drawerWidth}px` } }}>
            <Container maxWidth="lg">
              <Box content="main" padding={2} flexGrow={1}>
                <Switch>
                  <Route path="/posts" component={Posts} />
                  <Route path="/post/create" component={CreatePost} />
                  <Route path="/post/:id" component={Post} />
                  <Route path="/profile/:username" component={Profile} nest />
                  <Route path="/tags" component={Tags} />
                  <Route path="/chat" component={Chat} nest />
                  <Route path="/search" component={Search} nest />
                  <Route path="/tag/:tag" component={Tag} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/login" component={Login} />
                  <Route path="/signup" component={SignUp} />
                </Switch>
              </Box>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </AuthenticatedContext>
  );
}

export default App;
