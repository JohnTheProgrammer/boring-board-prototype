import {
  AddBox,
  ChatBubble,
  Explore,
  Login,
  Logout,
  Menu,
  Person,
  Search,
  Settings,
  Tag,
} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import { UnstyledLink } from "./UnstyledLink";
import React from "react";
import { AuthenticatedContext } from "../App";

export const ResponsiveNavigation = ({
  drawerWidth,
  onLogout,
}: {
  drawerWidth: number;
  onLogout: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const isAuthenticated = React.useContext(AuthenticatedContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationContent = (
    <>
      <Typography variant="h4" padding={2}>
        Boring Board
      </Typography>
      <List>
        {isAuthenticated && (
          <UnstyledLink href="/post/create">
            <ListItem>
              <Button variant="contained" fullWidth startIcon={<AddBox />}>
                Create Post
              </Button>
            </ListItem>
          </UnstyledLink>
        )}
        {!isAuthenticated && (
          <UnstyledLink href="/login">
            <ListItem>
              <Button variant="contained" fullWidth startIcon={<Login />}>
                Login
              </Button>
            </ListItem>
          </UnstyledLink>
        )}
        <UnstyledLink href="/posts">
          <ListItem>
            <ListItemIcon>
              <Explore />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItem>
        </UnstyledLink>
        <UnstyledLink href="/tags">
          <ListItem>
            <ListItemIcon>
              <Tag />
            </ListItemIcon>
            <ListItemText primary="Tags" />
          </ListItem>
        </UnstyledLink>
        <UnstyledLink href="/search">
          <ListItem>
            <ListItemIcon>
              <Search />
            </ListItemIcon>
            <ListItemText primary="Search" />
          </ListItem>
        </UnstyledLink>
        <UnstyledLink href="/chat">
          <ListItem>
            <ListItemIcon>
              <ChatBubble />
            </ListItemIcon>
            <ListItemText primary="Chat" />
          </ListItem>
        </UnstyledLink>
      </List>
      <Box sx={{ marginTop: "auto" }}>
        <Divider />
        <List>
          {isAuthenticated && (
            <>
              <UnstyledLink href={`/profile/${isAuthenticated.username}`}>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
              </UnstyledLink>
              <UnstyledLink href="/settings">
                <ListItem>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItem>
              </UnstyledLink>
              <button
                onClick={onLogout}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <ListItem>
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </button>
            </>
          )}
        </List>
      </Box>
    </>
  );

  return (
    <>
      {isMobile && (
        <>
          <AppBar
            position="sticky"
            color="default"
            elevation={1}
            sx={{
              mb: 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 2,
                }}
              >
                <Menu />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Boring Board
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: {
                xs: "block",
                lg: "none",
              },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            {navigationContent}
          </Drawer>
        </>
      )}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {navigationContent}
      </Drawer>
    </>
  );
};
