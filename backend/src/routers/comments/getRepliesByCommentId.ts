import z from "zod";
import { pool } from "../..";
import { publicProcedure } from "../../trpc";
import { RepliesCollection } from "../../schemas";

const GetRepliesByCommentIdInput = z.object({
  commentId: z.int(),
  cursor: z.int().nullish(),
});

export const getRepliesByCommentId = publicProcedure
  .input(GetRepliesByCommentIdInput)
  .output(RepliesCollection)
  .query(async (opts) => {
    const values = [opts.input.commentId];

    const whereConditions: string[] = ["replies.parent_comment_id = $1"];

    if (opts.input.cursor) {
      whereConditions.push(`replies.id > ${opts.input.cursor}`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const query = `
        SELECT 
          replies.*,
          users.username
        FROM comments replies
        JOIN users ON replies.user_id = users.id
        ${whereClause}
        ORDER BY replies.created_at ASC
        LIMIT 5;
      `;

    const result = await pool.query(query, values);
    return result.rows;
  });
