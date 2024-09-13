import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriptionQuotaDocument = HydratedDocument<SubscriptionQuota>;
export class SubscriptionQuota {
  @Prop({ default: 1000 })
  projectsQuota: number;

  @Prop({ default: 1000 })
  teamQuota: number;

  @Prop({ default: 1000 })
  teamMemberQuota: number;
}

export const PaymentScheduleSchema =
  SchemaFactory.createForClass(SubscriptionQuota);
