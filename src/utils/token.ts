import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "./classError";
import { UserRepository } from "../DB/repositories/user.repository";
import userModel from "../DB/models/user.model";
import { RevokeTokenRepository } from "../DB/repositories/revokeToken.repository";
import revokeTokenModel from "../DB/models/revokeToken.model";

const _userModel = new UserRepository(userModel);
const _revokeToken = new RevokeTokenRepository(revokeTokenModel);

export enum TokenType {
  access = "access",
  refresh = "refresh",
}

export const GenerateToken = async ({
  payload,
  signature,
  options,
}: {
  payload: object;
  signature: string;
  options: jwt.SignOptions;
}): Promise<string> => {
  return jwt.sign(payload, signature, options);
};

export const VerifyToken = async ({
  token,
  signature,
}: {
  token: string;
  signature: string;
}): Promise<JwtPayload> => {
  return jwt.verify(token, signature) as JwtPayload;
};

export const GetSignature = async (tokenType: TokenType, prefix: string) => {
  if (tokenType === TokenType.access) {
    if (prefix === process.env.BEARER_USER) {
      return process.env.SIGNATURE_USER_TOKEN;
    } else if (prefix === process.env.BEARER_ADMIN) {
      return process.env.SIGNATURE_ADMIN_TOKEN;
    } else {
      return null;
    }
  }
  if (tokenType === TokenType.refresh) {
    if (prefix === process.env.BEARER_USER) {
      return process.env.REFRESH_SIGNATURE_USER_TOKEN;
    } else if (prefix === process.env.BEARER_ADMIN) {
      return process.env.REFRESH_SIGNATURE_ADMIN_TOKEN;
    } else {
      return null;
    }
  }

  return null;
};

export const decodeTokenAndFetchUser = async (
  token: string,
  signature: string
) => {
  const decoded = await VerifyToken({ token, signature });
  if (!decoded) {
    throw new AppError("InValid token", 400);
  }

  const user = await _userModel.findOne({
    email: decoded.email,
    confirmed: true,
  });
  4;
  if (!user) {
    throw new AppError("user not exists", 404);
  }
  if (!user?.confirmed) {
    throw new AppError("please confirm email first", 400);
  }

  if (await _revokeToken.findOne({ tokenId: decoded?.jti })) {
    throw new AppError("Credentials have been changed, please log in again.", 401);
  }

  if (user?.changeCredentials?.getTime()! > decoded?.iat! * 1000) {
    throw new AppError("Credentials have been changed, please log in again.", 401);
  }

  return { decoded, user };
};
