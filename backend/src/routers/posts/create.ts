import z from "zod";
import { pool } from "../..";
import { authenticatedProcedure } from "../../trpc";
import {
  uploadFileToMinio,
  validateFile,
  formDataToObject,
  type MinioObject,
  deleteFileFromMinio,
} from "../../util";

const tagShape = z.string().toLowerCase().trim().max(180).min(1);

const CreatePostInput = z.object({
  title: z.string().trim().min(1).max(300),
  body: z.string().trim().max(40000),
  // due to formData to object conversion if we get only one tag it gets transformed into a string
  // this puts the string in an array
  tags: z
    .union([
      tagShape,
      z
        .array(tagShape)
        .max(20)
        .refine((items) => new Set(items).size === items.length, {
          message: "Tags must be unique",
        }),
    ])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  file: z.instanceof(File).optional(),
});

const CreatePostOutput = z.object({
  postId: z.int(),
});

const createPostQuery =
  "INSERT INTO posts (user_id, title, body, media) VALUES ($1, $2, $3, $4) RETURNING *";

const createTagsQuery = `
  INSERT INTO tags (post_id, tag)
  SELECT $1, unnest($2::text[])
`;

export const create = authenticatedProcedure
  .input(
    z
      .instanceof(FormData)
      .transform((formData) =>
        CreatePostInput.parse(formDataToObject(formData)),
      ),
  )
  .output(CreatePostOutput)
  .mutation(async (opts) => {
    const { title, body, file, tags } = opts.input;

    let media: MinioObject | undefined;
    let client;
    if (file) {
      validateFile(file);

      media = await uploadFileToMinio(file);
    }

    const createPostValues = [
      opts.ctx.authorization.userId,
      title,
      body,
      media?.url,
    ];

    try {
      client = await pool.connect();
      await client.query("BEGIN");
      const createPostRes = await client.query(
        createPostQuery,
        createPostValues,
      );
      if (tags) {
        const createTagsValues = [createPostRes.rows[0].id, tags];
        await client.query(createTagsQuery, createTagsValues);
      }
      await client.query("COMMIT");
      return {
        postId: createPostRes.rows[0].id,
      };
    } catch (err) {
      if (client) {
        await client.query("ROLLBACK");
      }
      if (media) {
        deleteFileFromMinio(media.name);
      }
      throw err;
    } finally {
      if (client) {
        client.release();
      }
    }
  });
