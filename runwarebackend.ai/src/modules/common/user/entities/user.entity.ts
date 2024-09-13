import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { HydratedDocument, Mixed, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  passwordResetToken: number;

  @Prop()
  passwordResetTokenExpiresAt: Date;

  @Prop()
  passwordUpdatedAt: Date;

  @Prop()
  emailVerificationToken: number;

  @Prop({ default: Date.now() + 10 * 60 * 1000 })
  emailVerificationTokenExpiresAt: Date;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: true })
  isLoginEnabled: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  role: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  profile: Mixed;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //this.activationCode = await bcrypt.hash(this.activationCode, 12);
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ $and: [{ isDeleted: { $ne: true } }] });
  next();
});
