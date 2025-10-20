import { Router } from "express";
import US from "./user.service";
import {
  confirmEmailSchema,
  forgetPasswordSchema,
  loginWithGmailSchema,
  logoutSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./user.validation";
import { validation } from "../../middleware/validation";
import { Authentication } from "../../middleware/Authentication";
import { TokenType } from "../../utils/token";
import { fileValidation, multerCloud, StorageEnum } from "../../middleware/multer.cloud";

const userRouter = Router();

userRouter.post("/signUp", validation(signUpSchema), US.signUp);
userRouter.patch(
  "/confirmEmail",
  validation(confirmEmailSchema),
  US.confirmEmail
);
userRouter.post("/signIn", validation(signInSchema), US.signIn);
userRouter.post("/loginWithGmail", validation(loginWithGmailSchema), US.loginWithGmail);
userRouter.get("/getProfile", Authentication(), US.getProfile);
userRouter.get(
  "/refreshToken",
  Authentication(TokenType.refresh),
  US.refreshToken
);
userRouter.post(
  "/logout",
  Authentication(),
  validation(logoutSchema),
  US.logout
);
userRouter.patch(
  "/forgetPassword",
  validation(forgetPasswordSchema),
  US.forgetPassword
);
userRouter.patch(
  "/resetPassword",
  validation(resetPasswordSchema),
  US.resetPassword
);
userRouter.post(
  "/upload",
  Authentication(),
  multerCloud({ fileTypes: fileValidation.image, storageType: StorageEnum.disk }).array("files"),
  US.uploadImage
);

export default userRouter;
