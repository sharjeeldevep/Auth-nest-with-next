import { Injectable } from '@nestjs/common';
import { QueuedJobRepository } from './queue-jobs.repository';
import { MongoGenericService } from '../../../common/services/mongo-generic.service';

@Injectable()
export class QueueJobsService extends MongoGenericService {
  constructor(private readonly queuedJobsRepository: QueuedJobRepository) {
    super(queuedJobsRepository);
  }
}
