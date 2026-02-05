import { formDataToObject } from "@trpc/server/unstable-core-do-not-import";
import z from "zod";
import { pool } from "../..";
import { authenticatedProcedure } from "../../trpc";
import { validateFile, uploadFileToMinio } from "../../util";
import { Reply } from "../../schemas";

const CreateReplyInput = z.object({
  body: z.string().trim(),
  post_id: z.coerce.number<string>().int(),
  comment_id: z.coerce.number<string>().int(),
  file: z.instanceof(File).optional(),
});

export const createReply = authenticatedProcedure
  .input(
    z
      .instanceof(FormData)
      .transform((formData) =>
        CreateReplyInput.parse(formDataToObject(formData)),
      ),
  )
  .output(Reply)
  .mutation(async (opts) => {
    const { comment_id, post_id, body, file } = opts.input;
    const query = `
        INSERT INTO comments (user_id, parent_comment_id, post_id, body, media) VALUES ($1, $2, $3, $4, $5) RETURNING * 
      `;

    let mediaUrl: string | undefined;
    if (file) {
      validateFile(file);

      mediaUrl = await uploadFileToMinio(file);
    }

    const values = [
      opts.ctx.authorization.userId,
      comment_id,
      post_id,
      body,
      mediaUrl,
    ];

    // TODO go back and delete the Minio file if postgres upload fails
    const postgresRes = await pool.query(query, values);
    return {
      ...postgresRes.rows[0],
      // Default values that are fetched from joins in other gets
      username: opts.ctx.authorization.username,
    };
  });
