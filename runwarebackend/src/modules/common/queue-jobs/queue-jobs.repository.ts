import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoGenericRepository } from '../../../common/repositories/mongo-generic.repository';
import { QueuedJob, QueuedJobDocument } from './entities/queue-job.entity';

export class QueuedJobRepository extends MongoGenericRepository<QueuedJobDocument> {
  constructor(
    @InjectModel(QueuedJob.name)
    readonly model: Model<QueuedJobDocument>,
  ) {
    super(model);
  }
}
