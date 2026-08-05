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

const createPaginationWhereQuery = (
  values: (string | number)[],
  col1: string,
  col2: string,
  val1: number,
  val2: number,
  tag: string,
  op: "<" | ">",
) => {
  const val1Index = values.push(val1);
  const val2Index = values.push(val2);
  const tagSqlValue = values.push(tag);

  return `
    WHERE 
      -- Scenario A: Primary metric moves down the list
      ${col1} ${op} $${val1Index}
      
      OR
      
      -- Scenario B: Primary is tied, check secondary metric
      (
        ${col1} = $${val1Index} AND 
        ${col2} < $${val2Index}
      )
      
      OR
      
      -- Scenario C: Both are tied, strictly paginate by unique tag name
      (
        ${col1} = $${val1Index} AND 
        ${col2} = $${val2Index} AND 
        tag_aggregates.tag > $${tagSqlValue}
      )
  `;
};

const GetManyInput = z.object({
  search: z.string().trim().nullish(),
  createdAt: z.enum(createdAtValues).nullish(),
  orderBy: z.enum(orderByValues).nullish(),
  cursor: z
    .object({ votes: z.int(), amount: z.int(), tag: z.string() })
    .nullish(),
});

export const tagsRouter = router({
  getMany: publicProcedure
    .input(GetManyInput)
    .output(TagsCollection)
    .query(async (opts) => {
      const values: (string | number)[] = [];
      const whereConditions: string[] = [];
      let paginationWhere = "";

      if (opts.input.search) {
        whereConditions.push(`
         (
          tags.tag ILIKE '%' || $${values.push(opts.input.search)} || '%'
        )
      `);
      }

      let createdAtInterval: string | undefined;

      if (opts.input.createdAt && opts.input.createdAt !== "Anytime") {
        createdAtInterval = opts.input.createdAt.toLowerCase();
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
            "ORDER BY tag_aggregates.posts_with_tag_votes_score ASC, tag_aggregates.posts_with_tag_amount DESC, tag_aggregates.tag ASC";
          if (opts.input.cursor) {
            paginationWhere = createPaginationWhereQuery(
              values,
              "tag_aggregates.posts_with_tag_votes_score",
              "tag_aggregates.posts_with_tag_amount",
              opts.input.cursor.votes,
              opts.input.cursor.amount,
              opts.input.cursor.tag,
              ">",
            );
          }
          break;
        case "Most Posted":
          orderClause =
            "ORDER BY tag_aggregates.posts_with_tag_amount DESC, tag_aggregates.posts_with_tag_votes_score DESC, tag_aggregates.tag ASC";
          if (opts.input.cursor) {
            paginationWhere = createPaginationWhereQuery(
              values,
              "tag_aggregates.posts_with_tag_amount",
              "tag_aggregates.posts_with_tag_votes_score",
              opts.input.cursor.amount,
              opts.input.cursor.votes,
              opts.input.cursor.tag,
              "<",
            );
          }
          break;
        case "Least Posted":
          orderClause =
            "ORDER BY tag_aggregates.posts_with_tag_amount ASC, tag_aggregates.posts_with_tag_votes_score DESC, tag_aggregates.tag ASC";
          if (opts.input.cursor) {
            paginationWhere = createPaginationWhereQuery(
              values,
              "tag_aggregates.posts_with_tag_amount",
              "tag_aggregates.posts_with_tag_votes_score",
              opts.input.cursor.amount,
              opts.input.cursor.votes,
              opts.input.cursor.tag,
              ">",
            );
          }
          break;
        case "Top Voted":
        default:
          orderClause =
            "ORDER BY tag_aggregates.posts_with_tag_votes_score DESC, tag_aggregates.posts_with_tag_amount DESC, tag_aggregates.tag ASC";
          if (opts.input.cursor) {
            paginationWhere = createPaginationWhereQuery(
              values,
              "tag_aggregates.posts_with_tag_votes_score",
              "tag_aggregates.posts_with_tag_amount",
              opts.input.cursor.votes,
              opts.input.cursor.amount,
              opts.input.cursor.tag,
              "<",
            );
          }
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
      ${paginationWhere}
      ${orderClause}
      LIMIT 12;
    `;

      const postgresRes = await pool.query(query, values);

      return postgresRes.rows;
    }),
});
