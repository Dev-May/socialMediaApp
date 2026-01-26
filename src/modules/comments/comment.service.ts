import { NextFunction, Request, Response } from "express";
import { HydratedDocument, Types } from "mongoose";
import userModel from "../../DB/models/user.model";
import postModel, {
  AllowCommentEnum,
  IPost,
} from "../../DB/models/post.model";
import commentModel, {
  IComment,
  OnModelEnum,
} from "../../DB/models/comment.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { PostRepository } from "../../DB/repositories/post.repository";
import { CommentRepository } from "../../DB/repositories/comment.repository";
import { AppError } from "../../utils/classError";
import { v4 as uuidv4 } from "uuid";
import { deleteFiles, uploadFiles } from "../../utils/s3.config";
import { AvailabilityPost } from "../posts/post.service";

class CommentService {
  private _userModel = new UserRepository(userModel);
  private _postModel = new PostRepository(postModel);
  private _commentModel = new CommentRepository(commentModel);

  constructor() {}

  // ===================== createComment =====================
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;
    let { content, tags, attachments, onModel } = req.body;

    let doc: HydratedDocument<IPost | IComment> | null = null;
    if (commentId || onModel === OnModelEnum.Comment) {
      const comment = await this._commentModel.findOne(
        {
          _id: commentId,
          refId: postId,
        },
        undefined,
        {
          populate: {
            path: "refId",
            match: {
              allowComment: AllowCommentEnum.allow,
              $or: AvailabilityPost(req),
            },
          },
        },
      );

      if (!comment?.refId) {
        return next(
          new AppError("comment not found or you are not authorized", 404),
        );
      }
      doc = comment;
    } else if (onModel == OnModelEnum.Post) {
      doc = await this._postModel.findOne({
        _id: postId,
        allowComment: AllowCommentEnum.allow,
        $or: AvailabilityPost(req),
      });

      if (!doc) {
        return next(
          new AppError("post not found or you are not authorized", 404),
        );
      }
    }

    if (
      tags?.length &&
      (await this._userModel.find({ filter: { _id: { $in: tags } } }))
        .length !== tags?.length
    ) {
      return next(new AppError("some tags are not valid", 400));
    }

    const assetFolderId = uuidv4();

    if (attachments?.length) {
      attachments = await uploadFiles({
        files: req?.files as Express.Multer.File[],
        path: `users/${doc?.createdBy}/posts/${doc?.assetFolderId}/comments/${assetFolderId}`,
      });
    }

    const comment = await this._commentModel.create({
      content,
      tags,
      attachments,
      assetFolderId,
      refId: doc?._id as unknown as Types.ObjectId,
      onModel,
      createdBy: req?.user?._id as unknown as Types.ObjectId,
    });

    if (!comment) {
      await deleteFiles({ urls: attachments || [] });
      return next(new AppError("fail to create comment", 400));
    }

    return res.status(201).json({ message: "created success", comment });
  };
}

export default new CommentService();
