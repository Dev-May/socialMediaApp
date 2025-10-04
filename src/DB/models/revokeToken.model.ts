import mongoose, { Types } from "mongoose";
import { required } from "zod/mini";

export interface IRevokeToken {
  userId: Types.ObjectId;
  tokenId: string;
  expireAt: Date;
}

const revokeTokenSchema = new mongoose.Schema<IRevokeToken>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tokenId: { type: String, required: true },
    expireAt: { type: Date, required: true },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

const revokeTokenModel =
  mongoose.models.RevokeToken ||
  mongoose.model<IRevokeToken>("RevokeToken", revokeTokenSchema);

export default revokeTokenModel;
