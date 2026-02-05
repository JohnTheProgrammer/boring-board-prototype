import Stack from "@mui/material/Stack";
import { PostCard } from "../components/PostCard";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../util/api";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Button,
  InputAdornment,
  InputBase,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";
import Box from "@mui/system/Box";
import { Search } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import z from "zod";
import { useSearchParams } from "wouter";

const createdAtValues = ["Anytime", "Hour", "Today", "Week", "Month", "Year"];
const orderByValues = ["Newest", "Top Voted", "Controversial", "Worst Voted"];

const getManyForm = z.object({
  search: z.string().trim(),
  createdAt: z.enum(createdAtValues),
  orderBy: z.enum(orderByValues),
});

type GetManyForm = z.infer<typeof getManyForm>;

export const Posts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, handleSubmit } = useForm<GetManyForm>();
  const query = useQuery(
    trpc.posts.getMany.queryOptions({
      search: searchParams.get("search"),
      createdAt: searchParams.get("createdAt"),
      orderBy: searchParams.get("orderBy"),
    }),
  );

  const onSubmit = handleSubmit(async (formValues) => {
    setSearchParams(formValues);
  });

  return (
    <Stack gap={2} paddingBottom={4}>
      <form onSubmit={onSubmit}>
        <Paper
          elevation={0}
          sx={{ display: "flex", alignItems: "center", padding: 1, gap: 2 }}
        >
          <InputBase
            placeholder="Search Posts"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            {...register("search")}
          />
          <TextField
            select
            variant="standard"
            slotProps={{
              select: {
                disableUnderline: true,
              },
              input: { ...register("createdAt") },
            }}
            sx={{ width: 125 }}
            defaultValue={createdAtValues[0]}
          >
            {createdAtValues.map((value, index) => (
              <MenuItem key={`createdAt-${value}-${index}`} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            variant="standard"
            slotProps={{
              select: {
                disableUnderline: true,
              },
              input: { ...register("orderBy") },
            }}
            defaultValue={orderByValues[0]}
            sx={{ width: 125 }}
          >
            {orderByValues.map((value, index) => (
              <MenuItem key={`orderBy-${value}-${index}`} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit">Search</Button>
        </Paper>
      </form>
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
          {query.data.posts.map((post) => (
            <PostCard key={`post-${post.id}`} post={post} />
          ))}
          <Box display="flex" justifyContent="center">
            <Button variant="outlined">Load More</Button>
          </Box>
        </>
      )}
    </Stack>
  );
};
