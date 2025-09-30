import { HydratedDocument, Model } from "mongoose";
import { AppError } from "../../utils/classError";
import { IUser } from "../models/user.model";
import { DbRepository } from "./db.repository";

export class UserRepository extends DbRepository<IUser> {
  constructor(protected model: Model<IUser>) {
    super(model);
  }

  async createOneUser(data: Partial<IUser>): Promise<HydratedDocument<IUser>> {
    const user: HydratedDocument<IUser> = await this.model.create(data);
    if (!user) {
      throw new AppError("Failed to create user");
    }
    return user;
  }
}
