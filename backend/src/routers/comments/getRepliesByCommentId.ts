import z from "zod";
import { pool } from "../..";
import { publicProcedure } from "../../trpc";
import { RepliesCollection } from "../../schemas";

const GetRepliesByCommentIdInput = z.object({ commentId: z.int() });

export const getRepliesByCommentId = publicProcedure
  .input(GetRepliesByCommentIdInput)
  .output(RepliesCollection)
  .query(async (opts) => {
    const values = [opts.input.commentId];
    const query = `
        SELECT 
          replies.*,
          users.username
        FROM comments replies
        JOIN users ON replies.user_id = users.id
        WHERE replies.parent_comment_id = $1
        ORDER BY replies.created_at ASC;
      `;

    const result = await pool.query(query, values);
    return { replies: result.rows };
  });
