import z from "zod";
import { pool } from "../..";
import { authenticatedProcedure } from "../../trpc";

export const vote = authenticatedProcedure
  .input(
    z.object({
      commentId: z.int(),
      vote: z.literal([1, -1]),
    }),
  )
  .mutation(async (opts) => {
    const query = `
        INSERT INTO votes (comment_id, user_id, vote)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, comment_id) DO UPDATE
        SET vote = CASE
                      WHEN votes.vote = EXCLUDED.vote THEN 0
                      ELSE EXCLUDED.vote
                  END
        RETURNING *;
      `;

    const values = [
      opts.input.commentId,
      opts.ctx.authorization.userId,
      opts.input.vote,
    ];

    await pool.query(query, values);

    return;
  });
