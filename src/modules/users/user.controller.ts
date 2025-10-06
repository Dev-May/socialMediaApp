import { Router } from "express";
import US from "./user.service";
import * as UV from "./user.validation";
import { validation } from "../../middleware/validation";
import { Authentication } from "../../middleware/Authentication";
import { TokenType } from "../../utils/token";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";

const userRouter = Router();

userRouter.post("/signUp", validation(UV.signUpSchema), US.signUp);
userRouter.patch(
  "/confirmEmail",
  validation(UV.confirmEmailSchema),
  US.confirmEmail
);
userRouter.post("/signIn", validation(UV.signInSchema), US.signIn);
userRouter.post(
  "/loginWithGmail",
  validation(UV.loginWithGmailSchema),
  US.loginWithGmail
);
userRouter.get("/getProfile", Authentication(), US.getProfile);
userRouter.get(
  "/refreshToken",
  Authentication(TokenType.refresh),
  US.refreshToken
);
userRouter.post(
  "/logout",
  Authentication(),
  validation(UV.logoutSchema),
  US.logout
);
userRouter.patch(
  "/forgetPassword",
  validation(UV.forgetPasswordSchema),
  US.forgetPassword
);
userRouter.patch(
  "/resetPassword",
  validation(UV.resetPasswordSchema),
  US.resetPassword
);
userRouter.post(
  "/upload",
  multerCloud({ fileTypes: fileValidation.image }).single("file"),
  US.uploadImage
);

export default userRouter;
