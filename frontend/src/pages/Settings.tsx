import React from "react";
import { Button, Typography } from "@mui/material";

export const Settings = () => {
  return (
    <>
      <Typography variant="h1" gutterBottom>Settings</Typography>
      <Button color="error">Log Out</Button>
      <Typography>Blocked Accounts</Typography>
      <Typography>Hidden Posts</Typography>
      <Typography>Filtered Tags</Typography>
      <Typography>Content Filters</Typography>
    </>
  );
}
