import z from "zod";
import { pool } from "../..";
import { publicProcedure } from "../../trpc";
import { Post } from "../../schemas";

const GetByIdInput = z.object({ postId: z.int() });

export const getById = publicProcedure
  .input(GetByIdInput)
  .output(Post)
  .query(async (opts) => {
    const userId = opts.ctx.authorization?.userId ?? null;

    const values = [opts.input.postId, userId];

    const query = `
      SELECT
        posts.*,
        users.username,
        COALESCE(user_post_vote.vote, 0)::int AS user_vote,
        COALESCE(post_votes.votes, 0)::int AS votes,
        COALESCE(comments.comment_amount, 0)::int AS comment_amount,
        COALESCE(comments.replies_amount, 0)::int AS replies_amount,
        COALESCE(ARRAY(SELECT tags.tag FROM tags WHERE tags.post_id = posts.id), ARRAY[]::text[]) AS tags
      FROM posts
      JOIN users
        ON posts.user_id = users.id

      LEFT JOIN LATERAL (
        SELECT vote
        FROM votes
        WHERE votes.post_id = posts.id
          AND ($2::int IS NOT NULL AND votes.user_id = $2::int)
      ) AS user_post_vote ON TRUE

      LEFT JOIN LATERAL (
        SELECT SUM(votes.vote) AS votes
        FROM votes
        WHERE votes.post_id = posts.id
      ) AS post_votes ON TRUE

      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS comment_amount,
          SUM(replies.replies_amount) AS replies_amount
        FROM comments
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS replies_amount
          FROM comments replies
          WHERE replies.parent_comment_id = comments.id
        ) AS replies ON TRUE
        WHERE comments.post_id = posts.id
          AND comments.parent_comment_id IS NULL
      ) AS comments ON TRUE

      WHERE posts.id = $1
      LIMIT 1;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  });
