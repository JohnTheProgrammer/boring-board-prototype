import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import {
  Button,
  CircularProgress,
  InputAdornment,
  InputBase,
  MenuItem,
  Paper,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
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
  const query = useQuery(
    trpc.tags.getMany.queryOptions({
      search: searchParams.get("search"),
      createdAt: searchParams.get("createdAt"),
      orderBy: searchParams.get("orderBy"),
    }),
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
            <InputBase
              placeholder="Search Tags"
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
            {query.data.tags.map((tag: any, index) => (
              <TagCard key={tag.tag + index} tag={tag} />
            ))}
          </Box>
        </>
      )}
    </>
  );
};
