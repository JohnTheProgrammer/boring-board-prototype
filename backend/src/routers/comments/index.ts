import { router } from "../../trpc";
import { create } from "./create";
import { createReply } from "./createReply";
import { deleteById } from "./deleteById";
import { getManyByPostId } from "./getManyByPostId";
import { getManyByUsername } from "./getManyByUsername";
import { getRepliesByCommentId } from "./getRepliesByCommentId";
import { vote } from "./vote";
import { getById } from "./getById";

export const commentsRouter = router({
  create,
  createReply,
  deleteById,
  getManyByPostId,
  getManyByUsername,
  getRepliesByCommentId,
  vote,
  getById,
});
