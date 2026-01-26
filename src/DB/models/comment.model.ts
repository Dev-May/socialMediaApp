import { Schema, Types, model, models } from "mongoose";

export enum OnModelEnum {
  Post = "Post",
  Comment = "Comment",
}

export interface IComment {
  content?: string;
  attachments?: string[];
  assetFolderId?: string;

  createdBy: Types.ObjectId;
  refId: Types.ObjectId;
  onModel: OnModelEnum;

  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];

  deletedAt?: Date;
  deletedBy?: Types.ObjectId;

  restoredAt?: Date;
  restoredBy?: Types.ObjectId;
}

export const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      minlength: 5,
      maxlength: 10000,
      required: function () {
        return this.attachments?.length === 0;
      },
    },
    attachments: [String],
    assetFolderId: String,

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refId: { type: Schema.Types.ObjectId, refPath: "onModel", required: true },
    onModel: { type: String, enum: OnModelEnum, required: true },

    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },

    restoredAt: { type: Date },
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

commentSchema.pre(["find", "findOne", "findOneAndUpdate", "findOneAndDelete"], async function(next) {
  const query = this.getQuery()
  const {paranoid, ...rest} = query;
  if(paranoid === false) {
    this.setQuery({...rest})
  } else {
    this.setQuery({...rest, deletedAt: {$exists: false}})
  }
  next()
})

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "refId",
  match: { onModel: OnModelEnum.Comment },
});


const commentModel = models.Comment || model("Comment", commentSchema);

export default commentModel;
