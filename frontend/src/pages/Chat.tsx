import React from "react";
import { getChatLogs } from "../util/api";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, Route, Switch, useLocation } from "wouter";
import { UnstyledLink } from "../components/UnstyledLink";
import { Info, InfoOutline } from "@mui/icons-material";

export const Chat = () => {
  const [location, navigate] = useLocation();
  const [chatType, setChatType] = React.useState<"user" | "tag">("user");

  const query = useQuery({ queryKey: ["getChats"], queryFn: getChatLogs });

  const dummyArray = Array.from(Array(10).keys());
  return (
    <>
      <Typography variant="h1" gutterBottom>
        Chat
      </Typography>
      <Paper elevation={1}>
        <Box
          display="flex"
          height="100vh"
          maxHeight="1000px"
          alignItems="stretch"
        >
          <Box padding={2} display="flex" flexDirection="column">
            <Box overflow="auto">
              <ButtonGroup fullWidth sx={{ paddingBottom: 1 }}>
                <Button
                  variant={chatType === "user" ? "contained" : "outlined"}
                  onClick={() => setChatType("user")}
                >
                  Users
                </Button>
                <Button
                  variant={chatType === "tag" ? "contained" : "outlined"}
                  onClick={() => setChatType("tag")}
                >
                  Tags
                </Button>
              </ButtonGroup>
              <Stack divider={<Divider orientation="horizontal" />} gap={1}>
                <TextField
                  id="searchChat"
                  fullWidth
                  label="Search"
                  placeholder="Input Username or Tag here"
                />
                {chatType === "user"
                  ? dummyArray.map((number: number) => (
                      <UnstyledLink to="/user/username" key={number}>
                        <Box>
                          <Typography>Username</Typography>
                          <Typography>Message</Typography>
                          <Typography> January 1st 2025</Typography>
                        </Box>
                      </UnstyledLink>
                    ))
                  : dummyArray.map((number: number) => (
                      <UnstyledLink to="/tag/general" key={number}>
                        <Box>
                          <Typography>#general</Typography>
                          <Typography>420 Active</Typography>
                        </Box>
                      </UnstyledLink>
                    ))}
              </Stack>
            </Box>
            <UnstyledLink to="/new">
              <Button fullWidth>Create new chat</Button>
            </UnstyledLink>
          </Box>
          <Divider orientation="vertical" variant="middle" flexItem />
          <Box flexGrow={1} display="flex" flexDirection="column">
            <Switch>
              <Route path="/user/:username">
                <Box padding={2}>
                  <Typography variant="h6">Username</Typography>
                </Box>
                <Divider />
                <Box
                  padding={2}
                  display="flex"
                  flexDirection="column"
                  flexGrow={1}
                >
                  {query.isPending || query.isError ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      flexGrow={1}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box>
                      {/* { */}
                      {/*   query.data.chatLogs.map((chat, index) => { */}
                      {/*     if (index == 0) { */}
                      {/*       return ( */}
                      {/*         <React.Fragment key={index}> */}
                      {/*           <Typography>{chat.sender} {chat.date}</Typography> */}
                      {/*           <Typography>{chat.message}</Typography> */}
                      {/*         </React.Fragment> */}
                      {/*       ) */}
                      {/*     } */}
                      {/**/}
                      {/*     if (index != 0 && chat.sender === query.data.chatLogs[index - 1].sender) { */}
                      {/*       return ( */}
                      {/*         <Typography key={index}>{chat.message}</Typography> */}
                      {/*       ) */}
                      {/*     } */}
                      {/**/}
                      {/*     return ( */}
                      {/*       <React.Fragment key={index}> */}
                      {/*         <Divider sx={{ marginY: 1 }} /> */}
                      {/*         <Typography>{chat.sender} {chat.date}</Typography> */}
                      {/*         <Typography>{chat.message}</Typography> */}
                      {/*       </React.Fragment> */}
                      {/*     ) */}
                      {/*   } */}
                      {/*   ) */}
                      {/* } */}
                    </Box>
                  )}
                  <Box display="flex" marginTop="auto" gap={1}>
                    <TextField placeholder="Your message goes here" fullWidth />
                    <Button variant="contained">Send</Button>
                  </Box>
                </Box>
              </Route>
              <Route path="/tag/:tag">
                <Box padding={2} display="flex" justifyContent="space-between">
                  <Typography variant="h6">#general</Typography>
                  <IconButton>
                    <InfoOutline />
                  </IconButton>
                </Box>
                <Divider />
                <Box
                  padding={2}
                  display="flex"
                  flexDirection="column"
                  flexGrow={1}
                >
                  {query.isPending || query.isError ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      flexGrow={1}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box>
                      {/* {query.data.chatLogs.map((chat, index) => { */}
                      {/*   if (index == 0) { */}
                      {/*     return ( */}
                      {/*       <React.Fragment key={index}> */}
                      {/*         <Typography> */}
                      {/*           {chat.sender} {chat.date} */}
                      {/*         </Typography> */}
                      {/*         <Typography>{chat.message}</Typography> */}
                      {/*       </React.Fragment> */}
                      {/*     ); */}
                      {/*   } */}
                      {/**/}
                      {/*   if ( */}
                      {/*     index != 0 && */}
                      {/*     chat.sender === query.data.chatLogs[index - 1].sender */}
                      {/*   ) { */}
                      {/*     return ( */}
                      {/*       <Typography key={index}>{chat.message}</Typography> */}
                      {/*     ); */}
                      {/*   } */}
                      {/**/}
                      {/*   return ( */}
                      {/*     <React.Fragment key={index}> */}
                      {/*       <Divider sx={{ marginY: 1 }} /> */}
                      {/*       <Typography> */}
                      {/*         {chat.sender} {chat.date} */}
                      {/*       </Typography> */}
                      {/*       <Typography>{chat.message}</Typography> */}
                      {/*     </React.Fragment> */}
                      {/*   ); */}
                      {/* })} */}
                    </Box>
                  )}
                  <Box display="flex" marginTop="auto" gap={1}>
                    <TextField placeholder="Your message goes here" fullWidth />
                    <Button variant="contained">Send</Button>
                  </Box>
                </Box>
              </Route>
              <Route path="/new">
                <Box
                  padding={2}
                  display="flex"
                  flexDirection="column"
                  flexGrow={1}
                >
                  <Box display="flex" gap={1}>
                    <TextField
                      id="newRecipient"
                      fullWidth
                      label="New Recipient"
                      placeholder="Add username here"
                    />
                    <Button variant="contained">Add</Button>
                  </Box>
                  <Box display="flex" marginTop="auto" gap={1}>
                    <TextField placeholder="Your message goes here" fullWidth />
                    <Button variant="contained">Send</Button>
                  </Box>
                </Box>
              </Route>
              <Route>
                <Box
                  display="flex"
                  flexGrow={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Typography>No chat selected... yet</Typography>
                </Box>
              </Route>
            </Switch>
          </Box>
        </Box>
      </Paper>
    </>
  );
};
