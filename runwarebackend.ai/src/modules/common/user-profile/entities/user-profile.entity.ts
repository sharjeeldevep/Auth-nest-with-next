import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/entities/user.entity';

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  role: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean })
  isDefault: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const userProfileSchema = SchemaFactory.createForClass(UserProfile);

export type IUserProfile = UserProfile & Document;
