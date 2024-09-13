import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoGenericRepository } from '../../../common/repositories/mongo-generic.repository';
import {
  UserProfile,
  UserProfileDocument,
} from './entities/user-profile.entity';

export class UserProfileRepository extends MongoGenericRepository<UserProfileDocument> {
  constructor(
    @InjectModel(UserProfile.name)
    readonly model: Model<UserProfileDocument>,
  ) {
    super(model);
  }
}
