import { Router } from "express";
import US from "./user.service";
import {
  confirmEmailSchema,
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

export default userRouter;
