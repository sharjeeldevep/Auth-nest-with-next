import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../modules/common/user/entities/user.entity';

export type PartialUserDocument = HydratedDocument<PartialUser>;

export class PartialUser {
  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop()
  email: string;

  @Prop()
  age: string;
}

export const partialUserSchema = SchemaFactory.createForClass(PartialUser);

export type IPartialUser = PartialUser & Document;
