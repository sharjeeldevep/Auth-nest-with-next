import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { RolesModule } from '../roles/roles.module';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    RolesModule,
    forwardRef(() => CommonModule),
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
