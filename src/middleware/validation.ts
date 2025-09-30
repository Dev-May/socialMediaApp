import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/classError";

type ReqType = keyof Request; // "body"|""
type SchemaType = Partial<Record<ReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = [];

    for (const key of Object.keys(schema) as ReqType[]) {
      // try {
      //   signUpSchema.parse(req.body);
      // } catch (error) {
      //   throw new AppError(JSON.parse(error as unknown as string));
      // }

      // await signUpSchema.parseAsync(req.body).catch((error) => {
      //   throw new AppError(JSON.parse(error as unknown as string));
      // });

      if (!schema[key]) continue;

      const result = schema[key].safeParse(req[key]);
      if (!result.success) {
        validationErrors.push(result.error);
      }
    }

    if (validationErrors.length) {
      throw new AppError(JSON.parse(validationErrors as unknown as string));
    }

    next();
  };
};
