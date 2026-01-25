import { NextFunction, Request, Response } from "express";
import userModel from "../../DB/models/user.model";
import postModel, { AvailabilityEnum, IPost } from "../../DB/models/post.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { PostRepository } from "../../DB/repositories/post.repository";
import { AppError } from "../../utils/classError";
import { v4 as uuidv4 } from "uuid";
import { deleteFiles, uploadFiles } from "../../utils/s3.config";
import {
  LikeActionEnum,
  likePostDto,
  likePostQueryDto,
} from "./post.validation";
import { UpdateQuery } from "mongoose";

class PostService {
  private _userModel = new UserRepository(userModel);
  private _postModel = new PostRepository(postModel);

  constructor() {}

  // ===================== createPost =====================
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    if (
      req?.body?.tags?.length &&
      (await this._userModel.find({ _id: { $in: req?.body?.tags } })).length !==
        req?.body?.tags?.length
    ) {
      throw new AppError("invalid user id", 400);
    }

    const assetFolderId = uuidv4();
    let attachments: string[] = [];
    if (req?.files?.length) {
      attachments = await uploadFiles({
        files: req?.files as unknown as Express.Multer.File[],
        path: `users/${req?.user?._id}/posts/${assetFolderId}`,
      });
    }

    const post = await this._postModel.create({
      ...req.body,
      attachments,
      assetFolderId,
      createdBy: req?.user?._id,
    });

    if (!post) {
      await deleteFiles({ urls: attachments || [] });
      throw new AppError("fail to create post", 500);
    }

    return res.status(201).json({ message: "created success", post });
  };

  // ===================== likePost =====================
  likePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId }: likePostDto = req.params as likePostDto;
    const { action }: likePostQueryDto = req.query as likePostQueryDto;

    let updateQuery: UpdateQuery<IPost> = {
      $addToSet: { likes: req?.user?._id },
    };

    if (action === LikeActionEnum.unlike) {
      updateQuery = { $pull: { likes: req?.user?._id } };
    }

    const post = await this._postModel.findOneAndUpdate(
      {
        _id: postId,
        $or: [
          { availability: AvailabilityEnum.public },
          { availability: AvailabilityEnum.private, createdBy: req?.user?._id },
          {
            availability: AvailabilityEnum.friends,
            createdBy: { $in: [...(req?.user?.friends || []), req?.user?._id] },
          },
        ],
      },
      updateQuery,
      { new: true },
    );

    if (!post) {
      throw new AppError("fail to like post", 404);
    }

    return res.status(201).json({ message: `${action}`, post });
  };

  // ===================== updatePost =====================
  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId }: likePostDto = req.params as likePostDto;

    const post = await this._postModel.findOne({
      _id: postId,
      createdBy: req?.user?._id,
      paranoid: false,
    });

    if (!post) {
      throw new AppError("fail to update post or unuthorized", 404);
    }

    if (req?.body?.content) {
      post.content = req?.body?.content;
    }

    if (req?.body?.availability) {
      post.availability = req?.body?.availability;
    }

    if (req?.body?.allowComment) {
      post.allowComment = req?.body?.allowComment;
    }

    if (req?.files?.length) {
      await deleteFiles({ urls: post.attachments || [] });
      post.attachments = await uploadFiles({
        files: req?.files as unknown as Express.Multer.File[],
        path: `users/${req?.user?._id}/posts/${post.assetFolderId}`,
      });
    }

    if (req?.body?.tags?.length) {
      if (
        req?.body?.tags?.length &&
        (await this._userModel.find({ _id: { $in: req?.body?.tags } }))
          .length !== req?.body?.tags?.length
      ) {
        throw new AppError("invalid user id", 400);
      }
      post.tags = req?.body?.tags;
    }

    await post.save();

    return res.status(201).json({ message: `updated`, post });
  };
}

export default new PostService();
