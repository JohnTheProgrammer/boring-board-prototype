import { TRPCError } from "@trpc/server";
import z from "zod";
import { pool } from "../..";
import { authenticatedProcedure } from "../../trpc";

const DeleteByIdInput = z.object({ commentId: z.int() });

export const deleteById = authenticatedProcedure
  .input(DeleteByIdInput)
  .mutation(async (opts) => {
    const values = [opts.input.commentId, opts.ctx.authorization.userId];

    const query = `
      DELETE FROM comments
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to delete this post.",
      });
    }

    return;
  });
