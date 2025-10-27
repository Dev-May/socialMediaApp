import z from "zod";
import { GenderType } from "../../DB/models/user.model";
import { Types } from "mongoose";

export enum FlagType {
  all = "all",
  current = "current",
}

export const signInSchema = {
  body: z
    .strictObject({
      email: z.email(),
      password: z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    })
    .required(),
};

export const loginWithGmailSchema = {
  body: z
    .strictObject({
      idToken: z.string(),
    })
    .required(),
};

export const signUpSchema = {
  body: signInSchema.body
    .extend({
      fullName: z.string().min(2).max(15).trim(),
      cPassword: z.string(),
      phone: z.string(),
      address: z.string(),
      age: z.number().min(18).max(60),
      gender: z.enum([GenderType.male, GenderType.female]),
    })
    .required()
    .superRefine((value, ctx) => {
      if (value.password !== value.cPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["cPassword"],
          message: "password not match",
        });
      }
    }),
};

export const confirmEmailSchema = {
  body: z
    .strictObject({
      email: z.email(),
      otp: z
        .string()
        .regex(/^\d{6}$/)
        .trim(),
    })
    .required(),
};

export const logoutSchema = {
  body: z
    .strictObject({
      flag: z.enum(FlagType),
    })
    .required(),
};

export const forgetPasswordSchema = {
  body: z
    .strictObject({
      email: z.email(),
    })
    .required(),
};

export const resetPasswordSchema = {
  body: confirmEmailSchema.body
    .extend({
      password: z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
      cPassword: z.string(),
    })
    .required()
    .superRefine((value, ctx) => {
      if (value.password !== value.cPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["cPassword"],
          message: "password not match",
        });
      }
    }),
};

export const freezeSchema = {
  params: z
    .strictObject({
      userId: z.string().optional(),
    })
    .refine(
      (value) => {
        return value?.userId ? Types.ObjectId.isValid(value.userId) : true;
      },
      { message: "Invalid userId", path: ["userId"] }
    ),
};

export const unfreezeSchema = {
  params: z
    .strictObject({
      userId: z.string(),
    })
    .required()
    .refine(
      (value) => {
        return value?.userId ? Types.ObjectId.isValid(value.userId) : true;
      },
      { message: "Invalid userId", path: ["userId"] }
    ),
};

export const deleteUserSchema = {
  params: z
    .strictObject({
      userId: z.string(),
    })
    .required()
    .refine(
      (value) => {
        return value?.userId ? Types.ObjectId.isValid(value.userId) : true;
      },
      { message: "Invalid userId", path: ["userId"] }
    ),
};

export type SignUpSchemaType = z.infer<typeof signUpSchema.body>;

export type SignInSchemaType = z.infer<typeof signInSchema.body>;

export type ConfirmEmailSchemaType = z.infer<typeof confirmEmailSchema.body>;

export type LogoutSchemaType = z.infer<typeof logoutSchema.body>;

export type forgetPasswordSchemaType = z.infer<
  typeof forgetPasswordSchema.body
>;

export type logInWithGmailSchemaType = z.infer<
  typeof loginWithGmailSchema.body
>;

export type resetPasswordSchemaType = z.infer<typeof resetPasswordSchema.body>;

export type freezeSchemaType = z.infer<typeof freezeSchema.params>;

export type unfreezeSchemaType = z.infer<typeof unfreezeSchema.params>;

export type deleteUserSchemaType = z.infer<typeof deleteUserSchema.params>;
