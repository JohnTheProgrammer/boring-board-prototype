import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import { useInfiniteQuery } from "@tanstack/react-query";
import { TagCard } from "../components/TagCard";
import { trpc } from "../util/api";
import { Search } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useSearchParams } from "wouter";
import z from "zod";

const createdAtValues = ["Anytime", "Hour", "Today", "Week", "Month", "Year"];
const orderByValues = [
  "Top Voted",
  "Most Posted",
  "Worst Voted",
  "Least Posted",
];

const getManyForm = z.object({
  search: z.string().trim(),
  createdAt: z.enum(createdAtValues),
  orderBy: z.enum(orderByValues),
});

type GetManyForm = z.infer<typeof getManyForm>;

export const Tags = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, handleSubmit } = useForm<GetManyForm>();
  const query = useInfiniteQuery(
    trpc.tags.getMany.infiniteQueryOptions(
      {
        search: searchParams.get("search"),
        createdAt: searchParams.get("createdAt"),
        orderBy: searchParams.get("orderBy"),
      },
      {
        getNextPageParam: (lastPage) => {
          if (lastPage.length === 0) {
            return undefined;
          }

          const lastTag = lastPage[lastPage.length - 1];
          return {
            votes: lastTag.posts_with_tag_votes_score,
            amount: lastTag.posts_with_tag_amount,
            tag: lastTag.tag,
          };
        },
      },
    ),
  );

  const onSubmit = handleSubmit(async (formValues) => {
    setSearchParams(formValues);
  });

  return (
    <>
      <Box paddingBottom={2}>
        <form onSubmit={onSubmit}>
          <Paper
            elevation={0}
            sx={{ display: "flex", alignItems: "center", padding: 1, gap: 2 }}
          >
            {/*TODO  fix defaultValues updating. I don't think we need to make these controlled, maybe useRef the url values on initial load?*/}
            <InputBase
              placeholder="Search Tags"
              fullWidth
              defaultValue={searchParams.get("search") || ""}
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
              defaultValue={searchParams.get("createdAt") || createdAtValues[0]}
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
              defaultValue={searchParams.get("orderBy") || orderByValues[0]}
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
      </Box>
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
            {query.data.pages.map((page) =>
              page.map((tag: any, index) => (
                <TagCard key={tag.tag + index} tag={tag} />
              )),
            )}
          </Box>
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
        </>
      )}
    </>
  );
};
