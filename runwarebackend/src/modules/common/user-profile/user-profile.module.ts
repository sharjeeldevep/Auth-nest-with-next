import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileRepository } from './user-profile.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfile, userProfileSchema } from './entities/user-profile.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: userProfileSchema },
    ]),
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService, UserProfileRepository],
  exports: [UserProfileService, UserProfileRepository],
})
export class UserProfileModule {}
