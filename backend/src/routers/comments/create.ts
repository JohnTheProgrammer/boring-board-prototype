import { formDataToObject } from "@trpc/server/unstable-core-do-not-import";
import z from "zod";
import { pool } from "../..";
import { Comment } from "../../schemas";
import { authenticatedProcedure } from "../../trpc";
import { validateFile, uploadFileToMinio } from "../../util";

const CreateCommentInput = z.object({
  body: z.string().trim(),
  post_id: z.coerce.number<string>().int(),
  file: z.instanceof(File).optional(),
});

export const create = authenticatedProcedure
  .input(
    z
      .instanceof(FormData)
      .transform((formData) =>
        CreateCommentInput.parse(formDataToObject(formData)),
      ),
  )
  .output(Comment)
  .mutation(async (opts) => {
    const { post_id, body, file } = opts.input;

    const query =
      "INSERT INTO comments (user_id, post_id, body, media) VALUES ($1, $2, $3, $4) RETURNING *";

    let mediaUrl: string | undefined;
    if (file) {
      validateFile(file);

      mediaUrl = await uploadFileToMinio(file);
    }

    const values = [opts.ctx.authorization.userId, post_id, body, mediaUrl];

    // TODO go back and delete the Minio file if postgres upload fails
    const postgresRes = await pool.query(query, values);
    return {
      ...postgresRes.rows[0],
      // Default values that are fetched from joins in other gets
      username: opts.ctx.authorization.username,
      votes: 0,
      user_vote: 0,
      replies_amount: 0,
    };
  });
