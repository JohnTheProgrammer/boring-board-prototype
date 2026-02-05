import z from "zod";
import { pool } from "../..";
import { authenticatedProcedure } from "../../trpc";

const VoteInput = z.object({
  postId: z.int(),
  vote: z.literal([1, -1]),
});

export const vote = authenticatedProcedure
  .input(VoteInput)
  .mutation(async (opts) => {
    const query = `
        INSERT INTO votes (post_id, user_id, vote)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, post_id) DO UPDATE
        SET vote = CASE
                      WHEN votes.vote = EXCLUDED.vote THEN 0
                      ELSE EXCLUDED.vote
                  END
        RETURNING *;
      `;

    const values = [
      opts.input.postId,
      opts.ctx.authorization.userId,
      opts.input.vote,
    ];

    await pool.query(query, values);

    return;
  });
