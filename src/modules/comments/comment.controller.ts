import { Router } from "express";
import CS from "./comment.service";
import * as CV from "./comment.validation";
import { validation } from "../../middleware/validation";
import { Authentication } from "../../middleware/Authentication";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";

const commentRouter = Router({mergeParams: true});

commentRouter.post(
  "/",
  Authentication(),
  multerCloud({ fileTypes: fileValidation.image }).array("attachments", 2),
  validation(CV.createCommentSchema),
  CS.createComment,
);

export default commentRouter;
