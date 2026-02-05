import z from "zod";
import { publicProcedure } from "../../trpc.ts";
import { pool } from "../../index.ts";
import { PostsCollection } from "../../schemas.ts";

const GetManyByUsernameInput = z.object({ username: z.string() });

export const getManyByUsername = publicProcedure
  .input(GetManyByUsernameInput)
  .output(PostsCollection)
  .query(async (opts) => {
    const userId = opts.ctx.authorization?.userId ?? null;
    const values = [userId, opts.input.username];

    const query = `
      SELECT
        posts.*,
        users.username,
        COALESCE(user_post_vote.vote, 0)::int AS user_vote,
        post_votes.votes AS votes,
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
          AND ($1::int IS NOT NULL AND votes.user_id = $1::int)
      ) AS user_post_vote ON TRUE

      LEFT JOIN LATERAL (
        SELECT
          COALESCE(SUM(votes.vote), 0)::int AS votes,
          COALESCE(COUNT(votes.vote), 0)::int AS vote_amount
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
      ) AS comments ON TRUE
      
      WHERE users.username = $2
      ORDER BY posts.created_at DESC
      ;
    `;

    const postgresRes = await pool.query(query, values);

    return {
      posts: postgresRes.rows,
    };
  });
