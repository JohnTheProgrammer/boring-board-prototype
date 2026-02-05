import z from "zod";
import { pool } from "../..";
import { publicProcedure } from "../../trpc";
import { CommentsCollection } from "../../schemas";

const GetCommentsByPostId = z.object({ postId: z.int() });

export const getCommentsByPostId = publicProcedure
  .input(GetCommentsByPostId)
  .output(CommentsCollection)
  .query(async (opts) => {
    const userId = opts.ctx.authorization?.userId ?? null;

    const values = [opts.input.postId, userId];

    const query = `
        SELECT 
          comments.*,
          users.username AS username,
          COALESCE(comment_votes.votes, 0)::int AS votes,
          COALESCE(user_comment_vote.vote, 0)::int AS user_vote,
          COALESCE(replies.replies_amount, 0)::int AS replies_amount
        FROM comments

        JOIN users 
          ON users.id = comments.user_id

        LEFT JOIN LATERAL (
          SELECT 
            SUM(votes.vote) AS votes
          FROM votes
          WHERE votes.comment_id = comments.id
        ) comment_votes ON TRUE

        LEFT JOIN LATERAL (
          SELECT 
            vote
          FROM votes
          WHERE votes.comment_id = comments.id
            AND ($2::int IS NOT NULL AND votes.user_id = $2::int)
        ) user_comment_vote ON TRUE

        LEFT JOIN LATERAL (
          SELECT 
            COUNT(*) AS replies_amount
          FROM comments replies
          WHERE replies.parent_comment_id = comments.id
        ) replies ON TRUE

        WHERE comments.post_id = $1
          AND comments.parent_comment_id IS NULL
        ORDER BY comments.created_at DESC;
      `;

    const result = await pool.query(query, values);
    return { comments: result.rows };
  });
