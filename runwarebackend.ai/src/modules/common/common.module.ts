import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { RolesModule } from './roles/roles.module';
import { QueueJobsModule } from './queue-jobs/queue-jobs.module';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  controllers: [CommonController],
  providers: [CommonService],
  imports: [RolesModule, QueueJobsModule, UserProfileModule],
})
export class CommonModule {}
