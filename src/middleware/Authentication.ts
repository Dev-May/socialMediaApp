import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/classError";
import {
  decodeTokenAndFetchUser,
  GetSignature,
  TokenType,
} from "../utils/token";

export const Authentication = (tokenType: TokenType = TokenType.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    const [prefix, token] = authorization?.split(" ") || [];
    if (!prefix || !token) {
      throw new AppError("InValid token", 400);
    }

    const signature = await GetSignature(tokenType, prefix);
    if (!signature) {
      throw new AppError("InValid signature", 400);
    }

    const decoded = await decodeTokenAndFetchUser(token, signature);
    if (!decoded) {
      throw new AppError("InValid token decoded", 400);
    }

    req.user = decoded?.user;
    req.decoded = decoded?.decoded;
    return next();
  };
};
