import React from "react";
import { Typography, TextField, MenuItem, Stack } from "@mui/material";

export const Tag = () => {

  return (
    <>
      <Typography variant="h1" gutterBottom>
        #general
      </Typography>
      <TextField label="Search Posts" fullWidth sx={{ marginBottom: 2 }} />
      <TextField
        id="sortInput"
        select
        label="Sort By"
        defaultValue="newest"
      >
        <MenuItem key="sortNewest" value="newest">Newest</MenuItem>
        <MenuItem key="sortTopVoted" value="topVoted">Top Voted</MenuItem>
        <MenuItem key="sortControversial" value="controversial">Controversial</MenuItem>
        <MenuItem key="sortWorstVoted" value="worstVoted">Worst Voted</MenuItem>
      </TextField>
    </>
  );
}
