import z from "zod";

export const UsersTable = z.object({
  id: z.int(),
  username: z.string().max(20),
  created_at: z.coerce.date<string>(),
  password: z.string(),
});

export const PostsTable = z.object({
  id: z.int(),
  user_id: z.int(),
  title: z.string(),
  body: z.string().nullable(),
  created_at: z.coerce.date<string>(),
  media: z.string().nullable(),
});

export const CommentsTable = z.object({
  id: z.int(),
  user_id: z.int(),
  post_id: z.int(),
  parent_comment_id: z.int().nullable(),
  body: z.string(),
  created_at: z.coerce.date<string>(),
  media: z.string().nullable(),
});

export const VotesTable = z.object({
  user_id: z.int(),
  post_id: z.int().nullable(),
  comment_id: z.int().nullable(),
  created_at: z.coerce.date<string>(),
  vote: z.int(),
});

export const TagsTable = z.object({
  post_id: z.int(),
  created_at: z.coerce.date<string>(),
  tag: z.string(),
});

export const Post = PostsTable.extend({
  username: UsersTable.shape.username,
  user_vote: z.literal([0, 1, -1]).nullish(),
  votes: z.int(),
  comment_amount: z.int(),
  replies_amount: z.int(),
  tags: z.array(z.string()),
});

// Rename this to PagedPosts once I add pagination
export const PostsCollection = z.object({
  posts: z.array(Post),
});

export const Comment = z.object({
  username: z.string(),
  body: z.string(),
  created_at: z.coerce.date<string>(),
  id: z.int(),
  media: z.string().nullish(),
  post_id: z.int(),
  votes: z.int(),
  user_vote: z.literal([0, 1, -1]).nullish(),
  replies_amount: z.int(),
});

export const CommentsCollection = z.object({
  comments: z.array(Comment),
});

export const Reply = z.object({
  username: z.string(),
  parent_comment_id: z.int(),
  id: z.int(),
  // TODO post_id should not be nullish after database migration
  post_id: z.int().nullish(),
  body: z.string(),
  created_at: z.coerce.date<string>(),
  media: z.string().nullish(),
});

export const RepliesCollection = z.object({
  replies: z.array(Reply),
});

export const Tag = z.object({
  tag: z.string(),
  posts_with_tag_votes_score: z.int(),
  posts_with_tag_amount: z.int(),
  top_posts: z
    .object({
      post_id: z.int(),
      title: z.string(),
      votes: z.int(),
    })
    .array(),
});

export const TagsCollection = z.object({
  tags: z.array(Tag),
});

export const User = z.object({
  username: z.string(),
  created_at: z.coerce.date<string>(),
  post_amount: z.int(),
  votes_total: z.int(),
  comment_amount: z.int(),
});
