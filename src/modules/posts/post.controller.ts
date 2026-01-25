import { Router } from "express";
import PS from "./post.service";
import * as PV from "./post.validation";
import { validation } from "../../middleware/validation";
import { Authentication } from "../../middleware/Authentication";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";

const postRouter = Router({});

postRouter.post(
  "/",
  Authentication(),
  multerCloud({ fileTypes: fileValidation.image }).array("attachments", 2),
  validation(PV.createPostSchema),
  PS.createPost,
);

postRouter.patch(
  "/:postId",
  Authentication(),
  validation(PV.likePostSchema),
  PS.likePost,
);

postRouter.patch(
  "/update/:postId",
  Authentication(),
  multerCloud({ fileTypes: fileValidation.image }).array("attachments", 2),
  validation(PV.updatePostSchema),
  PS.updatePost,
);

export default postRouter;
