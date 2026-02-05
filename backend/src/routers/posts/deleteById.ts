import z from "zod";
import { authenticatedProcedure } from "../../trpc";
import { pool } from "../..";
import { TRPCError } from "@trpc/server";

const DeleteByIdInput = z.object({ postId: z.int() });

export const deleteById = authenticatedProcedure
  .input(DeleteByIdInput)
  .mutation(async (opts) => {
    const values = [opts.input.postId, opts.ctx.authorization.userId];

    const query = `
      DELETE FROM posts
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
