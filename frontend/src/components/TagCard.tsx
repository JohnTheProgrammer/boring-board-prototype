import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { Article, ThumbUp } from "@mui/icons-material";
import { UnstyledLink } from "./UnstyledLink";
import type { RouterOutput } from "../util/api";

export const TagCard = (props: { tag: any }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" paddingBottom={1}>
          {props.tag.tag}
        </Typography>
        <Box display="flex" gap={2}>
          <Box display="flex" alignItems="center">
            <IconButton color="default" size="small" sx={{ paddingLeft: 0 }}>
              <Article />
            </IconButton>
            <Typography variant="body2">
              <Box component="span" fontWeight="fontWeightBold">
                {props.tag.posts_with_tag_amount}
              </Box>{" "}
              {props.tag.posts_with_tag_amount === 1 ? "posts" : "post"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton color="default" size="small">
              <ThumbUp />
            </IconButton>
            <Typography variant="body2">
              <Box component="span" fontWeight="fontWeightBold">
                {props.tag.posts_with_tag_votes_score}
              </Box>{" "}
              vote score
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ marginY: 1 }} />
        <Typography
          variant="caption"
          textTransform="uppercase"
          fontWeight={600}
          letterSpacing={0.5}
        >
          Top Posts
        </Typography>
        <Stack spacing={1} marginTop={1}>
          {props.tag.top_posts.map(
            (
              post: RouterOutput["tags"]["getMany"]["tags"][0]["top_posts"][0],
              index: number,
            ) => (
              <UnstyledLink
                href={`/post/${post.post_id}`}
                key={`tag-card-post-${post.post_id}`}
              >
                <Box
                  key={`${props.tag.tag}-${post.title}-${index}`}
                  sx={{ backgroundColor: "action.hover" }}
                  display="flex"
                  justifyContent="space-between"
                  alignItems={"center"}
                  gap={2}
                  p={1}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Chip
                    label={`${post.votes} vote score`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </UnstyledLink>
            ),
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
