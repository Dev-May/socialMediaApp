import { Router } from "express";
import US from "./user.service";
import {
  confirmEmailSchema,
  deleteUserSchema,
  forgetPasswordSchema,
  freezeSchema,
  loginWithGmailSchema,
  logoutSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  unfreezeSchema,
} from "./user.validation";
import { validation } from "../../middleware/validation";
import { Authentication } from "../../middleware/Authentication";
import { TokenType } from "../../utils/token";
import {
  fileValidation,
  multerCloud,
  StorageEnum,
} from "../../middleware/multer.cloud";

const userRouter = Router();

userRouter.post("/signUp", validation(signUpSchema), US.signUp);
userRouter.patch(
  "/confirmEmail",
  validation(confirmEmailSchema),
  US.confirmEmail
);

userRouter.post("/signIn", validation(signInSchema), US.signIn);

userRouter.post(
  "/loginWithGmail",
  validation(loginWithGmailSchema),
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
  "/uploadImage",
  Authentication(),
  multerCloud({
    fileTypes: fileValidation.image,
    storageType: StorageEnum.disk,
  }).array("files"),
  US.uploadImage
);

userRouter.post(
  "/uploadProfileImage",
  Authentication(TokenType.access),
  US.uploadProfileImage
);

userRouter.delete(
  "/freeze/{:userId}",
  Authentication(TokenType.access),
  validation(freezeSchema),
  US.freezeAccount
);

userRouter.patch(
  "/unfreeze/:userId",
  Authentication(TokenType.access),
  validation(unfreezeSchema),
  US.unfreezeAccount
);

userRouter.delete(
  "/deleteUser/:userId",
  Authentication(TokenType.access),
  validation(deleteUserSchema),
  US.deleteUser
);

export default userRouter;
