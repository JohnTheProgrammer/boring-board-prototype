import z from "zod";
import { pool } from "..";
import { publicProcedure, router } from "../trpc";
import { TagsCollection } from "../schemas";

const createdAtValues = ["Anytime", "Hour", "Today", "Week", "Month", "Year"];
const orderByValues = [
  "Top Voted",
  "Most Posted",
  "Worst Voted",
  "Least Posted",
];

const GetManyInput = z.object({
  search: z.string().trim().nullish(),
  createdAt: z.enum(createdAtValues).nullish(),
  orderBy: z.enum(orderByValues).nullish(),
});

export const tagsRouter = router({
  getMany: publicProcedure
    .input(GetManyInput)
    .output(TagsCollection)
    .query(async (opts) => {
      const values: string[] = [];
      const whereConditions: string[] = [];

      if (opts.input.search) {
        values.push(opts.input.search);
        whereConditions.push(`
         (
          tags.tag ILIKE '%' || $1 || '%'
        )
      `);
      }

      let createdAtInterval: string | undefined;

      switch (opts.input.createdAt) {
        case "Hour":
          createdAtInterval = "hour";
          break;
        case "Today":
          createdAtInterval = "day";
          break;
        case "Week":
          createdAtInterval = "week";
          break;
        case "Month":
          createdAtInterval = "month";
          break;
        case "Year":
          createdAtInterval = "year";
          break;
        case "Anytime":
      }

      let createdAtSql: string | undefined;
      if (createdAtInterval) {
        createdAtSql = `posts.created_at >= now() - interval '1 ${createdAtInterval}'`;
        whereConditions.push(createdAtSql);
      }

      let orderClause: string;

      switch (opts.input.orderBy) {
        case "Worst Voted":
          orderClause =
            "ORDER BY tag_aggregates.posts_with_tag_votes_score ASC";
          break;
        case "Most Posted":
          orderClause = "ORDER BY tag_aggregates.posts_with_tag_amount DESC";
          break;
        case "Least Posted":
          orderClause = "ORDER BY tag_aggregates.posts_with_tag_amount ASC";
          break;
        case "Top Voted":
        default:
          orderClause =
            "ORDER BY tag_aggregates.posts_with_tag_votes_score DESC";
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const query = `
      WITH tag_aggregates AS (
        SELECT
          tags.tag,
          COUNT(DISTINCT tags.post_id)::int AS posts_with_tag_amount,
          COALESCE(SUM(votes.vote), 0)::int AS posts_with_tag_votes_score
        FROM tags
        INNER JOIN posts
          ON posts.id = tags.post_id
        LEFT JOIN votes
          ON votes.post_id = posts.id
        ${whereClause}
        GROUP BY
          tags.tag
      )

      SELECT
        tag_aggregates.tag,
        tag_aggregates.posts_with_tag_amount,
        tag_aggregates.posts_with_tag_votes_score,
        top_posts.top_posts
      FROM tag_aggregates

      LEFT JOIN LATERAL (
        SELECT
          ARRAY_AGG(
            jsonb_build_object(
              'post_id', ranked_posts.post_id,
              'title', ranked_posts.title,
              'votes', ranked_posts.votes
            )
            ORDER BY ranked_posts.votes DESC
          ) AS top_posts
        FROM (
          SELECT
            posts.id AS post_id,
            posts.title,
            COALESCE(SUM(votes.vote), 0)::int AS votes
          FROM tags
          INNER JOIN posts
            ON posts.id = tags.post_id
          LEFT JOIN votes
            ON votes.post_id = posts.id
          WHERE tags.tag = tag_aggregates.tag
            ${createdAtSql ? `AND ${createdAtSql}` : ""}
          GROUP BY
            posts.id,
            posts.title
          ORDER BY
            votes DESC
          LIMIT 3
        ) AS ranked_posts
      ) AS top_posts ON TRUE

      ${orderClause};
    `;

      const postgresRes = await pool.query(query, values);

      return {
        tags: postgresRes.rows,
      };
    }),
});
