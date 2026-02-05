import z from "zod";
import { pool } from "../../index.ts";
import { publicProcedure } from "../../trpc.ts";
import { PostsCollection } from "../../schemas.ts";

const createdAtValues = ["Anytime", "Hour", "Today", "Week", "Month", "Year"];
const orderByValues = ["Newest", "Top Voted", "Controversial", "Worst Voted"];

const GetManyInput = z.object({
  search: z.string().trim().nullish(),
  createdAt: z.enum(createdAtValues).nullish(),
  orderBy: z.enum(orderByValues).nullish(),
});

export const getMany = publicProcedure
  .input(GetManyInput)
  .output(PostsCollection)
  .query(async (opts) => {
    const userId = opts.ctx.authorization?.userId ?? null;
    const values = [userId];
    const whereConditions: string[] = [];

    if (opts.input.search) {
      values.push(opts.input.search);
      whereConditions.push(`
         (
          posts.title ILIKE '%' || $2 || '%'
          OR posts.body ILIKE '%' || $2 || '%'
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

    if (createdAtInterval) {
      whereConditions.push(
        `posts.created_at >= now() - interval '1 ${createdAtInterval}'`,
      );
    }

    let orderClause: string;

    switch (opts.input.orderBy) {
      case "Top Voted":
        orderClause = "ORDER BY post_votes.votes DESC";
        break;
      case "Worst Voted":
        orderClause = "ORDER BY post_votes.votes ASC";
        break;
      case "Controversial":
        orderClause =
          "ORDER BY ABS(post_votes.votes) ASC, post_votes.vote_amount DESC";
        break;
      case "Newest":
      default:
        orderClause = "ORDER BY posts.created_at DESC";
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const query = `
      SELECT
        posts.*,
        users.username,
        COALESCE(user_post_vote.vote, 0)::int AS user_vote,
        post_votes.votes AS votes,
        COALESCE(comments.comment_amount, 0)::int AS comment_amount,
        COALESCE(comments.replies_amount, 0)::int AS replies_amount,
        COALESCE(ARRAY(SELECT tags.tag FROM tags WHERE tags.post_id = posts.id), ARRAY[]::text[]) AS tags
      FROM posts
      JOIN users
        ON posts.user_id = users.id

      LEFT JOIN LATERAL (
        SELECT vote
        FROM votes
        WHERE votes.post_id = posts.id
          AND ($1::int IS NOT NULL AND votes.user_id = $1::int)
      ) AS user_post_vote ON TRUE

      LEFT JOIN LATERAL (
        SELECT
          COALESCE(SUM(votes.vote), 0)::int AS votes,
          COALESCE(COUNT(votes.vote), 0)::int AS vote_amount
        FROM votes
        WHERE votes.post_id = posts.id
      ) AS post_votes ON TRUE

      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS comment_amount,
          SUM(replies.replies_amount) AS replies_amount
        FROM comments
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS replies_amount
          FROM comments replies
          WHERE replies.parent_comment_id = comments.id
        ) AS replies ON TRUE
        WHERE comments.post_id = posts.id
          AND comments.parent_comment_id IS NULL
      ) AS comments ON TRUE

      
      ${whereClause}
      ${orderClause}
      ;
    `;

    const postgresRes = await pool.query(query, values);

    return {
      posts: postgresRes.rows,
    };
  });
