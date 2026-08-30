import React from "react";
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
import ListItem, { type ListItemProps } from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import ListItemIcon, {
  type ListItemIconProps,
} from "@mui/material/ListItemIcon";
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
import { styled } from "@mui/system";
import { AuthenticatedContext } from "../App";
import { mono, moss } from "../util/theme";

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

  const StyledListItem = styled(ListItem)<ListItemProps>(() => ({
    paddingTop: "4px",
    paddingBottom: "4px",
  }));

  const StyledListItemIcon = styled(ListItemIcon)<ListItemIconProps>(() => ({
    minWidth: "40px",
  }));

  const navigationContent = (
    <>
      <Box paddingX={3} paddingTop={2} display="flex" gap={1}>
        <Box
          sx={{
            height: "26px",
            width: "26px",
            borderRadius: "4px",
            backgroundColor: moss[700],
          }}
        ></Box>
        <Typography variant="h6" sx={{ fontFamily: mono }}>
          boring board
        </Typography>
      </Box>

      <Box paddingX={1} paddingTop={2} paddingBottom={1}>
        {isAuthenticated && (
          <UnstyledLink href="/post/create">
            <Button variant="contained" fullWidth sx={{ fontWeight: 600 }}>
              New Post
            </Button>
          </UnstyledLink>
        )}
        {!isAuthenticated && (
          <UnstyledLink href="/login">
            <Button variant="contained" fullWidth startIcon={<Login />}>
              Login
            </Button>
          </UnstyledLink>
        )}
      </Box>
      <List sx={{ paddingY: 0, paddingX: 1 }}>
        <UnstyledLink href="/posts">
          <StyledListItem>
            <StyledListItemIcon>
              <Explore />
            </StyledListItemIcon>
            <ListItemText primary="Posts" />
          </StyledListItem>
        </UnstyledLink>
        <UnstyledLink href="/tags">
          <StyledListItem>
            <StyledListItemIcon>
              <Tag />
            </StyledListItemIcon>
            <ListItemText primary="Tags" />
          </StyledListItem>
        </UnstyledLink>
        <UnstyledLink href="/search">
          <StyledListItem>
            <StyledListItemIcon>
              <Search />
            </StyledListItemIcon>
            <ListItemText primary="Search" />
          </StyledListItem>
        </UnstyledLink>
        <UnstyledLink href="/chat">
          <StyledListItem>
            <StyledListItemIcon>
              <ChatBubble />
            </StyledListItemIcon>
            <ListItemText primary="Chat" />
          </StyledListItem>
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
