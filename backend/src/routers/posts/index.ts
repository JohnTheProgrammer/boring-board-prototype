import { router } from "../../trpc";
import { create } from "./create";
import { getMany } from "./getMany";
import { getById } from "./getById";
import { vote } from "./vote";
import { deleteById } from "./deleteById";
import { getManyByUsername } from "./getManyByUsername";

export const postsRouter = router({
  create,
  getMany: router({
    all: getMany,
    byUsername: getManyByUsername,
  }),
  getById,
  deleteById,
  vote,
});
