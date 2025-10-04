import { Router } from "express";
import US from "./user.service";
import {
  confirmEmailSchema,
  logoutSchema,
  signInSchema,
  signUpSchema,
} from "./user.validation";
import { validation } from "../../middleware/validation";
import { Authentication } from "../../middleware/Authentication";

const userRouter = Router();

userRouter.post("/signUp", validation(signUpSchema), US.signUp);
userRouter.patch(
  "/confirmEmail",
  validation(confirmEmailSchema),
  US.confirmEmail
);
userRouter.post("/signIn", validation(signInSchema), US.signIn);
userRouter.get("/getProfile", Authentication(), US.getProfile);
userRouter.post(
  "/logout",
  Authentication(),
  validation(logoutSchema),
  US.logout
);

export default userRouter;
