import z from "zod";
import { pool } from "../..";
import { authenticatedProcedure } from "../../trpc";
import { uploadFileToMinio, validateFile, formDataToObject } from "../../util";

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

    let mediaUrl: string | undefined;
    if (file) {
      validateFile(file);

      mediaUrl = await uploadFileToMinio(file);
    }

    const createPostValues = [
      opts.ctx.authorization.userId,
      title,
      body,
      mediaUrl,
    ];

    // TODO go back and delete the Minio file if postgres upload fails
    // TODO return the whole post object so the frontend can update local query cache
    const createPostRes = await pool.query(createPostQuery, createPostValues);

    if (tags) {
      const createTagsValues = [createPostRes.rows[0].id, tags];
      await pool.query(createTagsQuery, createTagsValues);
    }

    return {
      postId: createPostRes.rows[0].id,
    };
  });
