import {
  Document,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';

export abstract class MongoGenericRepository<T extends Document> {
  constructor(protected readonly entityModel: Model<T>) {}

  async executeQuery(query) {
    return query.exec();
  }

  async countDocuments(entityFilterQuery: FilterQuery<T>) {
    return this.entityModel.countDocuments(entityFilterQuery).exec();
  }

  async findAll(filter, select, sort, limit, skip, populate) {
    const query = this.entityModel
      .find({ ...filter, isDeleted: false }, {}, { sort })
      .populate(populate)
      .select(select)
      .lean();

    limit && query.limit(limit);
    skip && query.skip(skip);

    return query.exec();
  }

  findOne(filter, select, sort, populate) {
    return this.entityModel
      .findOne(filter, {}, { sort: sort })
      .populate(populate)
      .select(select)
      .lean();
  }

  async findById(id, populate?, select?) {
    return await this.entityModel
      .findById(id)
      .populate(populate)
      .select(select)
      .lean();
  }

  async create(createEntityData: unknown) {
    const entity = new this.entityModel(createEntityData);

    return entity.save();
  }

  async createBulk(createEntityDataArray: unknown[]) {
    const entities = createEntityDataArray.map(
      (data) => new this.entityModel(data),
    );

    // Choose bulk insert method based on your database/ORM capabilities
    return await this.entityModel.insertMany(entities);
  }

  async findByIdAndUpdate(
    id: string,
    updateEntityData: UpdateQuery<unknown>,
  ): Promise<T | null> {
    return this.entityModel.findByIdAndUpdate(id, updateEntityData, {
      new: true,
    });
  }

  async updateOne(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<unknown> {
    return this.entityModel.updateOne(filter, updated, options);
  }

  async updateMany(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<unknown> {
    return this.entityModel.updateMany(filter, updated, options);
  }

  async deleteMany(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.entityModel.deleteMany(entityFilterQuery);
    return deleteResult.deletedCount >= 1;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    return this.entityModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
  }
}
