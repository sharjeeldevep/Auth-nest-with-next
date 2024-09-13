import { Injectable } from '@nestjs/common';
import { MongoGenericService } from '../../../common/services/mongo-generic.service';
import { UserProfileRepository } from './user-profile.repository';

@Injectable()
export class UserProfileService extends MongoGenericService {
  constructor(private readonly userProfileRepository: UserProfileRepository) {
    super(userProfileRepository);
  }
}
