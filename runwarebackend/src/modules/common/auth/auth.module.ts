import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RolesModule } from "../roles/roles.module";
import { UserModule } from "../user/user.module";
import { CommonModule } from "../../../common/common.module";
import { QueueJobsModule } from "../queue-jobs/queue-jobs.module";
import { UserProfileModule } from "../user-profile/user-profile.module";

@Module({
  imports: [
    RolesModule,
    UserModule,
    CommonModule,
    QueueJobsModule,
    UserProfileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
