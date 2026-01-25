import z from "zod";
import { AllowCommentEnum, AvailabilityEnum } from "../../DB/models/post.model";
import { generalRules } from "../../utils/generalRules";

export enum LikeActionEnum {
  like = "like",
  unlike = "unlike"
}

export const createPostSchema = {
  body: z.strictObject({
    content: z.string().min(5).max(10000).optional(),
    attachments: z.array(generalRules.file).max(2).optional(),
    assetFolderId: z.string().optional(),

    allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.allow).optional(),
    availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.public).optional(),

    tags: z.array(generalRules.id).refine((value) => {
      return new Set(value).size === value?.length;
    }, {message: "Duplicated tags"}).optional()
  }).superRefine((data, ctx) => {
    if (!data?.content && !data.attachments?.length) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "content or attachments is required"
      });
    }
  })
};

export const updatePostSchema = {
  body: z.strictObject({
    content: z.string().min(5).max(10000).optional(),
    attachments: z.array(generalRules.file).max(2).optional(),
    assetFolderId: z.string().optional(),

    allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.allow).optional(),
    availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.public).optional(),

    tags: z.array(generalRules.id).refine((value) => {
      return new Set(value).size === value?.length;
    }, {message: "Duplicated tags"}).optional()
  }).superRefine((data, ctx) => {
    if (!Object.values(data).length) {
      ctx.addIssue({
        code: "custom",
        message: "at least one field is required"
      });
    }
  })
};

export const likePostSchema ={
  params: z.strictObject({
    postId: generalRules.id
  }),
  query: z.strictObject({
    action: z.enum(LikeActionEnum).default(LikeActionEnum.like)
  })
}

export type likePostDto = z.infer<typeof likePostSchema.params>;
export type likePostQueryDto = z.infer<typeof likePostSchema.query>; 