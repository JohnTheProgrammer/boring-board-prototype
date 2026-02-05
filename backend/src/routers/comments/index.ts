import { router } from "../../trpc";
import { create } from "./create";
import { createReply } from "./createReply";
import { deleteById } from "./deleteById";
import { getCommentsByPostId } from "./getCommentsByPostId";
import { getManyByUsername } from "./getManyByUsername";
import { getRepliesByCommentId } from "./getRepliesByCommentId";
import { vote } from "./vote";

export const commentsRouter = router({
  create,
  createReply,
  deleteById,
  getCommentsByPostId,
  getManyByUsername,
  getRepliesByCommentId,
  vote,
});
