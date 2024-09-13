import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ROLE_TYPE } from '../roles.constants';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ unique: true })
  name: string;

  @Prop()
  type: ROLE_TYPE;

  @Prop()
  permissions: [];

  @Prop({ default: false })
  isDeleted: boolean;
}

export const roleSchema = SchemaFactory.createForClass(Role);
