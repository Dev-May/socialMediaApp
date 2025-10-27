import {
  DeleteResult,
  HydratedDocument,
  Model,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";

export abstract class DbRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }

  async findOne(
    filter: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument>
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOne(filter, select);
  }

  async updateOne(
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, update);
  }

  async findOneAndUpdate(filter: RootFilterQuery<TDocument>, update: UpdateQuery<TDocument>, options: QueryOptions<TDocument> | null = {new: true}): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findOneAndUpdate(filter, update, options)
  }

  async deleteOne(filter: RootFilterQuery<TDocument>): Promise<DeleteResult> {
    return await this.model.deleteOne(filter);
  }

  async findOneAndDelete(filter: RootFilterQuery<TDocument>, options?: QueryOptions<TDocument> | null): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findOneAndDelete(filter, options)
  }
}
