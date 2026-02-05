import z from "zod";
import { publicProcedure, router, jwtSecretKey } from "../trpc";
import { hash, verify } from "../util";
import { pool } from "..";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { User } from "../schemas";

export const userRouter = router({
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .output(z.object({ user: User }))
    .query(async (opts) => {
      const values = [opts.input.username];
      const query = `
        SELECT 
        users.username,
        users.created_at,
        COALESCE(posts.post_amount, 0)::int AS post_amount,
        COALESCE(posts.votes_total, 0)::int AS votes_total,
        COALESCE(comments.comment_amount, 0)::int AS comment_amount
        FROM users 
        LEFT JOIN LATERAL (
          SELECT COUNT(posts.*) as post_amount,
          COALESCE(SUM(votes.vote), 0)::int as votes_total 
          FROM posts 
          INNER JOIN votes
          ON votes.post_id = posts.id  
          WHERE
          posts.user_id = users.id 
        ) AS posts ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(*) as comment_amount
          FROM comments 
          WHERE
          comments.user_id = users.id
        ) AS comments ON true
        WHERE username=$1 
        LIMIT 1
        ;
    `;

      const postgresRes = await pool.query(query, values);
      return {
        user: postgresRes.rows[0],
      };
    }),
  create: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;

      const hashedPassword = await hash(input.password);
      const query =
        "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *";
      const values = [input.username, hashedPassword];

      const postgresRes = await pool.query(query, values);

      let data = {
        userId: postgresRes.rows[0].id,
        username: postgresRes.rows[0].username,
      };

      const jwtToken = jwt.sign(data, jwtSecretKey);
      opts.ctx.setAuthorizationCookie(jwtToken);

      return;
    }),
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;

      const query = "SELECT * FROM users WHERE username=$1 LIMIT 1";
      const values = [input.username];

      const postgresRes = await pool.query(query, values);

      const passwordMatch = await verify(
        input.password,
        postgresRes.rows[0].password,
      );

      if (passwordMatch) {
        let data = {
          userId: postgresRes.rows[0].id,
          username: postgresRes.rows[0].username,
        };

        const jwtToken = jwt.sign(data, jwtSecretKey);
        opts.ctx.setAuthorizationCookie(jwtToken);

        return;
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),

  logout: publicProcedure.mutation((opts) => {
    opts.ctx.removeAuthorizationCookie();
    return { message: "Successful Logout" };
  }),

  isAuthenticated: publicProcedure
    .output(z.object({ username: z.string() }))
    .query((opts) => {
      if (opts.ctx.authorization) {
        return { username: opts.ctx.authorization.username };
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }),
});
