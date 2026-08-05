import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const Settings = () => {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        Settings
      </Typography>
      <Button color="error">Log Out</Button>
      <Typography>Blocked Accounts</Typography>
      <Typography>Hidden Posts</Typography>
      <Typography>Filtered Tags</Typography>
      <Typography>Content Filters</Typography>
    </>
  );
};
