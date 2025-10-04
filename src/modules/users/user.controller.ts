import { Router } from "express";
import US from "./user.service";
import {
  confirmEmailSchema,
  signInSchema,
  signUpSchema,
} from "./user.validation";
import { validation } from "../../middleware/validation";

const userRouter = Router();

userRouter.post("/signUp", validation(signUpSchema), US.signUp);
userRouter.patch(
  "/confirmEmail",
  validation(confirmEmailSchema),
  US.confirmEmail
);
userRouter.post("/signIn", validation(signInSchema), US.signIn);

export default userRouter;
