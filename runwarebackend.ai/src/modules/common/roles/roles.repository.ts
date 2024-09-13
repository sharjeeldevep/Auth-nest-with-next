import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoGenericRepository } from '../../../common/repositories/mongo-generic.repository';
import { Role, RoleDocument } from './entities/role.entity';

export class RoleRepository extends MongoGenericRepository<RoleDocument> {
  constructor(@InjectModel(Role.name) readonly roleModel: Model<RoleDocument>) {
    super(roleModel);
  }
}
