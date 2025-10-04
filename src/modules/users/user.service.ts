import { NextFunction, Request, Response } from "express";
import userModel, { RoleType } from "../../DB/models/user.model";
import { AppError } from "../../utils/classError";
import { UserRepository } from "../../DB/repositories/user.repository";
import { Compare, Hash } from "../../utils/hash";
import { eventEmitter } from "../../utils/event";
import { generateOTP } from "../../service/sendEmail.service";
import {
  ConfirmEmailSchemaType,
  SignInSchemaType,
  SignUpSchemaType,
} from "./user.validation";
import { GenerateToken } from "../../utils/token";
import { v4 as uuidv4 } from "uuid";

class UserService {
  private _userModel = new UserRepository(userModel);

  constructor() {}

  // ===================== signUp =====================
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    let {
      fullName,
      email,
      password,
      cPassword,
      address,
      age,
      gender,
      phone,
    }: SignUpSchemaType = req.body;

    if (await this._userModel.findOne({ email })) {
      throw new AppError("email already exists", 409);
    }

    const hash = await Hash(password);
    const otp = await generateOTP();
    const hashedOtp = await Hash(String(otp));

    eventEmitter.emit("confirmEmail", { email, otp });

    const user = await this._userModel.createOneUser({
      fullName,
      otp: hashedOtp,
      email,
      password: hash,
      address,
      age,
      gender,
      phone,
    });

    return res.status(201).json({ message: "created success", user });
  };

  // ===================== confirmEmail =====================
  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp }: ConfirmEmailSchemaType = req.body;

    const user = await this._userModel.findOne({
      email,
      confirmed: { $exists: false },
    });
    if (!user) {
      throw new AppError("email not found or already confirmed", 404);
    }

    if (!(await Compare(otp, user?.otp!))) {
      throw new AppError("invalid otp", 400);
    }

    await this._userModel.updateOne(
      { email: user?.email },
      { confirmed: true, $unset: { otp: "" } }
    );

    return res.status(200).json({ message: "confirmed" });
  };

  // ===================== signIn =====================
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: SignInSchemaType = req.body;

    const user = await this._userModel.findOne({
      email,
      confirmed: true,
    });
    if (!user) {
      throw new AppError("email not found or not confirmed yet", 404);
    }
    if (!(await Compare(password, user?.password))) {
      throw new AppError("invalid password", 400);
    }

    const jwtid = uuidv4();
    // Create token
    const access_token = await GenerateToken({
      payload: { id: user._id, email: user.email },
      signature:
        user.role == RoleType.user
          ? process.env.SIGNATURE_USER_TOKEN!
          : process.env.SIGNATURE_ADMIN_TOKEN!,
      options: {
        expiresIn: 60 * 60,
        jwtid,
      },
    });

    const refresh_token = await GenerateToken({
      payload: { id: user._id, email: user.email },
      signature:
        user.role == RoleType.user
          ? process.env.REFRESH_SIGNATURE_USER_TOKEN!
          : process.env.REFRESH_SIGNATURE_ADMIN_TOKEN!,
      options: {
        expiresIn: "1y",
        jwtid,
      },
    });
    return res
      .status(200)
      .json({ message: "success", access_token, refresh_token });
  };
}

export default new UserService();
