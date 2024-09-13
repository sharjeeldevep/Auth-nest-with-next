import { Module } from '@nestjs/common';
import { QueueJobsService } from './queue-jobs.service';
import { QueueJobsController } from './queue-jobs.controller';
import { QueuedJobRepository } from './queue-jobs.repository';
import { MongooseModule } from '@nestjs/mongoose';

import { queuedJobSchema, QueuedJob } from './entities/queue-job.entity';
import { QueueCronService } from './queue-jobs.cron.service';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QueuedJob.name, schema: queuedJobSchema },
    ]),
    CommonModule,
  ],
  controllers: [QueueJobsController],
  providers: [QueueJobsService, QueuedJobRepository, QueueCronService],
  exports: [QueueJobsService, QueuedJobRepository],
})
export class QueueJobsModule {}
