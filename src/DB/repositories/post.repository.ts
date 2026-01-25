import { Model } from "mongoose";
import { DbRepository } from "./db.repository";
import { IPost } from "../models/post.model";

export class PostRepository extends DbRepository<IPost> {
  constructor(protected override model: Model<IPost>) {
    super(model);
  }
}
